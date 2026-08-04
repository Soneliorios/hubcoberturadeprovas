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

/** Converte um registro do banco no formato usado pela UI. */
function toContentItem(c: Conteudo): ContentItem {
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
    url: c.url,
    thumbnail: c.thumbnail ?? undefined,
    prova: c.prova ?? undefined,
    estados,
    publicadoEm: c.publicadoEm.toISOString(),
    duracaoMin: c.duracaoMin ?? undefined,
  };
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
 * Seções com conteúdos para a home.
 * Seções "cadastro" para visitante sem cadastro chegam BLOQUEADAS:
 * `itens` vazio (nenhum dado real no HTML) e `total` para os placeholders.
 */
export async function getSecoesComConteudos(
  cadastrado: boolean
): Promise<SecaoComConteudos[]> {
  const secoes = await prisma.secao.findMany({
    orderBy: { ordem: "asc" },
    include: { conteudos: { orderBy: { publicadoEm: "desc" } } },
  });

  return secoes.map((s) => {
    const bloqueada = s.acesso === "cadastro" && !cadastrado;
    return {
      secao: toSecaoInfo(s),
      bloqueada,
      itens: bloqueada ? [] : s.conteudos.map(toContentItem),
      total: s.conteudos.length,
    };
  });
}

/** Uma seção com seus conteúdos (página "ver todos"), com o mesmo gate. */
export async function getSecaoComConteudos(
  secaoId: string,
  cadastrado: boolean
): Promise<SecaoComConteudos | null> {
  const s = await prisma.secao.findUnique({
    where: { id: secaoId },
    include: { conteudos: { orderBy: { publicadoEm: "desc" } } },
  });
  if (!s) return null;
  const bloqueada = s.acesso === "cadastro" && !cadastrado;
  return {
    secao: toSecaoInfo(s),
    bloqueada,
    itens: bloqueada ? [] : s.conteudos.map(toContentItem),
    total: s.conteudos.length,
  };
}

/**
 * Notificações do sino: derivadas dos conteúdos mais recentes do banco.
 * Sem cadastro/admin, considera apenas seções abertas (não vaza título restrito).
 */
export async function getNotificacoes(desbloqueado: boolean) {
  const recentes = await prisma.conteudo.findMany({
    where: desbloqueado ? {} : { secao: { acesso: "aberto" } },
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
