import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  ContentItem,
  SecaoComConteudos,
  SecaoInfo,
  UF,
} from "@/lib/types";
import type { ConteudoInput } from "@/lib/conteudo-schema";
import type { Conteudo, Secao } from "@prisma/client";

/** Converte um registro do banco no formato usado pela UI.
 *  `bloqueado` gera um TEASER: título/prova/duração visíveis (isca de
 *  conversão), mas SEM url nem thumbnail — nenhum dado do asset no HTML. */
function toContentItem(c: Conteudo, bloqueado = false): ContentItem {
  let estados: UF[] = [];
  try {
    estados = JSON.parse(c.estados) as UF[];
  } catch {
    estados = [];
  }
  return {
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao ?? undefined,
    tipo: c.tipo === "arquivo" ? "arquivo" : "youtube",
    url: bloqueado ? "" : c.url,
    bloqueado: bloqueado || undefined,
    thumbnail: bloqueado ? undefined : c.thumbnail ?? undefined,
    prova: c.prova ?? undefined,
    estados,
    publicadoEm: c.publicadoEm.toISOString(),
    duracaoMin: c.duracaoMin ?? undefined,
  };
}

/**
 * Acesso efetivo de um conteúdo: o campo próprio sobrescreve o da seção;
 * "herdar" (padrão) segue a seção.
 */
function conteudoRestrito(c: Conteudo, secaoAcesso: string): boolean {
  if (c.acesso === "aberto") return false;
  if (c.acesso === "cadastro") return true;
  return secaoAcesso === "cadastro";
}

export function toSecaoInfo(s: Secao): SecaoInfo {
  return {
    id: s.id,
    titulo: s.titulo,
    icone: s.icone ?? undefined,
    nivel: s.nivel === "R+" ? "R+" : "R1",
    tipoPadrao: s.tipoPadrao === "arquivo" ? "arquivo" : "youtube",
    acesso: s.acesso === "cadastro" ? "cadastro" : "aberto",
    ordem: s.ordem,
  };
}

/**
 * Monta a visão de uma seção respeitando o acesso EFETIVO por conteúdo
 * (o campo do conteúdo sobrescreve o da seção; "herdar" segue a seção):
 * - visitante desbloqueado: tudo normal;
 * - todos os itens restritos: `bloqueada` = vitrine borrada (mistério, sem dados);
 * - mistura: carrossel com cards reais + teasers (título visível, sem url).
 */
function montarSecao(
  s: Secao & { conteudos: Conteudo[] },
  desbloqueado: boolean
): SecaoComConteudos {
  const restritos = desbloqueado
    ? new Set<string>()
    : new Set(
        s.conteudos
          .filter((c) => conteudoRestrito(c, s.acesso))
          .map((c) => c.id)
      );

  const total = s.conteudos.length;
  // Vitrine-mistério apenas quando NADA da seção está acessível.
  const bloqueada = total > 0 && restritos.size === total;

  return {
    secao: toSecaoInfo(s),
    bloqueada,
    itens: bloqueada
      ? []
      : s.conteudos.map((c) => toContentItem(c, restritos.has(c.id))),
    total,
  };
}

/** Seções com conteúdos para a home (gate por seção E por conteúdo). */
export async function getSecoesComConteudos(
  desbloqueado: boolean
): Promise<SecaoComConteudos[]> {
  const secoes = await prisma.secao.findMany({
    orderBy: { ordem: "asc" },
    include: { conteudos: { orderBy: { publicadoEm: "desc" } } },
  });
  return secoes.map((s) => montarSecao(s, desbloqueado));
}

/** Uma seção com seus conteúdos (página "ver todos"), com o mesmo gate. */
export async function getSecaoComConteudos(
  secaoId: string,
  desbloqueado: boolean
): Promise<SecaoComConteudos | null> {
  const s = await prisma.secao.findUnique({
    where: { id: secaoId },
    include: { conteudos: { orderBy: { publicadoEm: "desc" } } },
  });
  if (!s) return null;
  return montarSecao(s, desbloqueado);
}

/**
 * Notificações do sino: derivadas dos conteúdos mais recentes do banco.
 * Sem cadastro/admin, considera apenas seções abertas (não vaza título restrito).
 */
export async function getNotificacoes(desbloqueado: boolean) {
  const recentes = await prisma.conteudo.findMany({
    // Sem desbloqueio, só conteúdos efetivamente abertos (próprio ou herdado).
    where: desbloqueado
      ? {}
      : {
          OR: [
            { acesso: "aberto" },
            { acesso: "herdar", secao: { acesso: "aberto" } },
          ],
        },
    orderBy: { publicadoEm: "desc" },
    take: 3,
    select: { id: true, titulo: true, publicadoEm: true },
  });
  return recentes.map((c) => ({
    id: c.id,
    titulo: `${c.titulo} já disponível`,
    data: c.publicadoEm.toISOString().slice(0, 10),
    lida: false,
  }));
}

/** Lista bruta para a tabela do admin (com a seção de cada conteúdo). */
export async function listarConteudos() {
  return prisma.conteudo.findMany({
    orderBy: { criadoEm: "desc" },
    include: { secao: { select: { titulo: true } } },
  });
}

export async function getConteudo(id: string): Promise<Conteudo | null> {
  return prisma.conteudo.findUnique({ where: { id } });
}

/** Deriva o nível a partir da seção escolhida. */
async function nivelDaSecao(secaoId: string): Promise<string> {
  const s = await prisma.secao.findUnique({ where: { id: secaoId } });
  return s?.nivel ?? "R1";
}

export async function criarConteudo(input: ConteudoInput): Promise<Conteudo> {
  return prisma.conteudo.create({
    data: {
      titulo: input.titulo,
      descricao: input.descricao || null,
      secaoId: input.secaoId,
      nivel: await nivelDaSecao(input.secaoId),
      acesso: input.acesso,
      tipo: input.tipo,
      url: input.url,
      prova: input.prova || null,
      estados: JSON.stringify(input.estados ?? []),
      thumbnail: input.thumbnail || null,
      duracaoMin: input.duracaoMin ?? null,
    },
  });
}

export async function atualizarConteudo(
  id: string,
  input: ConteudoInput
): Promise<Conteudo> {
  return prisma.conteudo.update({
    where: { id },
    data: {
      titulo: input.titulo,
      descricao: input.descricao || null,
      secaoId: input.secaoId,
      nivel: await nivelDaSecao(input.secaoId),
      acesso: input.acesso,
      tipo: input.tipo,
      url: input.url,
      prova: input.prova || null,
      estados: JSON.stringify(input.estados ?? []),
      thumbnail: input.thumbnail || null,
      duracaoMin: input.duracaoMin ?? null,
    },
  });
}

export async function excluirConteudo(id: string): Promise<void> {
  await prisma.conteudo.delete({ where: { id } });
}
