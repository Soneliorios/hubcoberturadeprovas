import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  ProvaDetalhe,
  ProvaResumo,
  ProvaStatus,
  PrevisaoPublica,
} from "@/lib/previsoes-types";
import type { Prova, Previsao } from "@prisma/client";

function toStatus(s: string): ProvaStatus {
  return s === "resultado" || s === "encerrada" ? s : "votacao";
}

/* ============================ PÚBLICO ============================ */

/**
 * Provas visíveis na aba pública: só as que já têm ao menos uma previsão
 * (prova vazia recém-criada não vira beco sem saída), ordenadas.
 */
export async function listarProvasPublicas(): Promise<ProvaResumo[]> {
  const provas = await prisma.prova.findMany({
    where: { previsoes: { some: {} } },
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { _count: { select: { previsoes: true } } },
  });
  if (provas.length === 0) return [];

  // Participantes distintos por prova em UMA consulta (sem N+1).
  const provaIds = provas.map((p) => p.id);
  const votos = await prisma.voto.findMany({
    where: { previsao: { provaId: { in: provaIds } } },
    select: { leadId: true, previsao: { select: { provaId: true } } },
  });
  const porProva = new Map<string, Set<string>>();
  for (const v of votos) {
    const pid = v.previsao.provaId;
    (porProva.get(pid) ?? porProva.set(pid, new Set()).get(pid)!).add(v.leadId);
  }

  return provas.map((p) => ({
    id: p.id,
    nome: p.nome,
    estado: p.estado ?? undefined,
    nivel: p.nivel ?? undefined,
    status: toStatus(p.status),
    dataProva: p.dataProva?.toISOString(),
    totalPrevisoes: p._count.previsoes,
    participantes: porProva.get(p.id)?.size ?? 0,
  }));
}

/** Detalhe de uma prova com agregados de votos e o voto/placar do usuário. */
export async function getProvaDetalhe(
  provaId: string,
  leadId: string | null
): Promise<ProvaDetalhe | null> {
  const prova = await prisma.prova.findUnique({
    where: { id: provaId },
    include: { previsoes: { orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] } },
  });
  if (!prova) return null;

  const ids = prova.previsoes.map((p) => p.id);

  // Agregado de votos (sim/não) por previsão
  const agregados =
    ids.length === 0
      ? []
      : await prisma.voto.groupBy({
          by: ["previsaoId", "voto"],
          where: { previsaoId: { in: ids } },
          _count: { _all: true },
        });
  const contagem = new Map<string, { sim: number; total: number }>();
  for (const id of ids) contagem.set(id, { sim: 0, total: 0 });
  for (const a of agregados) {
    const c = contagem.get(a.previsaoId)!;
    c.total += a._count._all;
    if (a.voto) c.sim += a._count._all;
  }

  // Votos do próprio usuário
  const meusVotos = new Map<string, boolean>();
  if (leadId && ids.length > 0) {
    const votos = await prisma.voto.findMany({
      where: { leadId, previsaoId: { in: ids } },
      select: { previsaoId: true, voto: true },
    });
    for (const v of votos) meusVotos.set(v.previsaoId, v.voto);
  }

  // participantes distintos
  const participantes =
    ids.length === 0
      ? 0
      : (
          await prisma.voto.findMany({
            where: { previsaoId: { in: ids } },
            distinct: ["leadId"],
            select: { leadId: true },
          })
        ).length;

  let acertos = 0;
  let resolvidas = 0;
  let votadas = 0;
  let votouNaProva = 0;

  const previsoes: PrevisaoPublica[] = prova.previsoes.map((p) => {
    const c = contagem.get(p.id)!;
    const meuVoto = meusVotos.has(p.id) ? meusVotos.get(p.id)! : null;
    const pctSim = c.total > 0 ? Math.round((c.sim / c.total) * 100) : 0;
    if (meuVoto !== null) votouNaProva += 1;

    let acertei: boolean | null = null;
    if (p.caiu !== null) {
      resolvidas += 1;
      if (meuVoto !== null) {
        votadas += 1;
        acertei = meuVoto === p.caiu;
        if (acertei) acertos += 1;
      }
    }

    return {
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao ?? undefined,
      especialidade: p.especialidade ?? undefined,
      caiu: p.caiu,
      votosSim: c.sim,
      votosTotal: c.total,
      pctSim,
      meuVoto,
      acertei,
    };
  });

  return {
    id: prova.id,
    nome: prova.nome,
    estado: prova.estado ?? undefined,
    nivel: prova.nivel ?? undefined,
    status: toStatus(prova.status),
    dataProva: prova.dataProva?.toISOString(),
    totalPrevisoes: prova.previsoes.length,
    participantes,
    previsoes,
    placar: { acertos, resolvidas, votadas, votouNaProva },
    podeVotar: !!leadId,
  };
}

/**
 * Registra/atualiza/remove o voto do usuário numa previsão.
 * Só permitido enquanto a prova está em "votacao".
 * `voto === null` remove o voto (destoggle).
 */
export async function registrarVoto(
  previsaoId: string,
  leadId: string,
  voto: boolean | null
): Promise<{ ok: boolean; motivo?: string }> {
  const previsao = await prisma.previsao.findUnique({
    where: { id: previsaoId },
    include: { prova: { select: { status: true } } },
  });
  if (!previsao) return { ok: false, motivo: "Previsão não encontrada." };
  if (previsao.prova.status !== "votacao") {
    return { ok: false, motivo: "A votação desta prova está encerrada." };
  }

  if (voto === null) {
    await prisma.voto.deleteMany({ where: { previsaoId, leadId } });
    return { ok: true };
  }

  await prisma.voto.upsert({
    where: { previsaoId_leadId: { previsaoId, leadId } },
    update: { voto },
    create: { previsaoId, leadId, voto },
  });
  return { ok: true };
}

/* ============================ ADMIN ============================ */

export interface PrevisaoAdmin extends Previsao {
  votosSim: number;
  votosTotal: number;
}

export async function listarProvasAdmin() {
  return prisma.prova.findMany({
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { _count: { select: { previsoes: true } } },
  });
}

export async function getProvaAdmin(id: string): Promise<Prova | null> {
  return prisma.prova.findUnique({ where: { id } });
}

export async function getProvaComPrevisoesAdmin(id: string) {
  const prova = await prisma.prova.findUnique({
    where: { id },
    include: { previsoes: { orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] } },
  });
  if (!prova) return null;

  const ids = prova.previsoes.map((p) => p.id);
  const agregados =
    ids.length === 0
      ? []
      : await prisma.voto.groupBy({
          by: ["previsaoId", "voto"],
          where: { previsaoId: { in: ids } },
          _count: { _all: true },
        });
  const contagem = new Map<string, { sim: number; total: number }>();
  for (const id2 of ids) contagem.set(id2, { sim: 0, total: 0 });
  for (const a of agregados) {
    const c = contagem.get(a.previsaoId)!;
    c.total += a._count._all;
    if (a.voto) c.sim += a._count._all;
  }

  const previsoes: PrevisaoAdmin[] = prova.previsoes.map((p) => ({
    ...p,
    votosSim: contagem.get(p.id)!.sim,
    votosTotal: contagem.get(p.id)!.total,
  }));
  return { prova, previsoes };
}

export async function criarProva(data: {
  nome: string;
  estado?: string;
  nivel?: string;
  dataProva?: Date | null;
}): Promise<Prova> {
  const max = await prisma.prova.aggregate({ _max: { ordem: true } });
  return prisma.prova.create({
    data: {
      nome: data.nome,
      estado: data.estado || null,
      nivel: data.nivel || null,
      dataProva: data.dataProva ?? null,
      ordem: (max._max.ordem ?? -1) + 1,
    },
  });
}

export async function atualizarProva(
  id: string,
  data: { nome: string; estado?: string; nivel?: string; dataProva?: Date | null }
): Promise<Prova> {
  return prisma.prova.update({
    where: { id },
    data: {
      nome: data.nome,
      estado: data.estado || null,
      nivel: data.nivel || null,
      dataProva: data.dataProva ?? null,
    },
  });
}

export async function definirStatusProva(
  id: string,
  status: ProvaStatus
): Promise<void> {
  await prisma.prova.update({ where: { id }, data: { status } });
}

export async function excluirProva(id: string): Promise<void> {
  await prisma.prova.delete({ where: { id } });
}

export async function criarPrevisao(data: {
  provaId: string;
  titulo: string;
  descricao?: string;
  especialidade?: string;
}): Promise<Previsao> {
  const max = await prisma.previsao.aggregate({
    where: { provaId: data.provaId },
    _max: { ordem: true },
  });
  return prisma.previsao.create({
    data: {
      provaId: data.provaId,
      titulo: data.titulo,
      descricao: data.descricao || null,
      especialidade: data.especialidade || null,
      ordem: (max._max.ordem ?? -1) + 1,
    },
  });
}

export async function atualizarPrevisao(
  id: string,
  data: { titulo: string; descricao?: string; especialidade?: string }
): Promise<Previsao> {
  return prisma.previsao.update({
    where: { id },
    data: {
      titulo: data.titulo,
      descricao: data.descricao || null,
      especialidade: data.especialidade || null,
    },
  });
}

/** Define o resultado de uma previsão: true (caiu), false (não caiu), null (limpar). */
export async function definirResultado(
  id: string,
  caiu: boolean | null
): Promise<void> {
  await prisma.previsao.update({ where: { id }, data: { caiu } });
}

export async function excluirPrevisao(id: string): Promise<void> {
  await prisma.previsao.delete({ where: { id } });
}
