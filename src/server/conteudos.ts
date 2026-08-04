import "server-only";
import { prisma } from "@/lib/prisma";
import { BLOCOS_INFO, getBloco } from "@/data/blocos";
import type { ContentBlock, ContentItem, UF } from "@/lib/types";
import type { ConteudoInput } from "@/lib/conteudo-schema";
import type { Conteudo } from "@prisma/client";

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

/** Todos os conteúdos agrupados nos 6 blocos (para a home). */
export async function getBlocosComConteudos(): Promise<ContentBlock[]> {
  const conteudos = await prisma.conteudo.findMany({
    orderBy: { publicadoEm: "desc" },
  });

  return BLOCOS_INFO.map((info) => ({
    id: info.id,
    titulo: info.titulo,
    nivel: info.nivel,
    icone: info.icone,
    tipoPadrao: info.tipoPadrao,
    itens: conteudos.filter((c) => c.blocoId === info.id).map(toContentItem),
  }));
}

/** Conteúdos de um bloco específico (para a página "ver todos"). */
export async function getConteudosDoBloco(
  blocoId: string
): Promise<{ bloco: ContentBlock; itens: ContentItem[] } | null> {
  const info = getBloco(blocoId);
  if (!info) return null;
  const conteudos = await prisma.conteudo.findMany({
    where: { blocoId },
    orderBy: { publicadoEm: "desc" },
  });
  const itens = conteudos.map(toContentItem);
  return {
    bloco: { ...info, itens },
    itens,
  };
}

/** Lista bruta para a tabela do admin. */
export async function listarConteudos(): Promise<Conteudo[]> {
  return prisma.conteudo.findMany({ orderBy: { criadoEm: "desc" } });
}

export async function getConteudo(id: string): Promise<Conteudo | null> {
  return prisma.conteudo.findUnique({ where: { id } });
}

/** Deriva o nível a partir do bloco escolhido. */
function nivelDoBloco(blocoId: string): string {
  return getBloco(blocoId)?.nivel ?? "R1";
}

export async function criarConteudo(input: ConteudoInput): Promise<Conteudo> {
  return prisma.conteudo.create({
    data: {
      titulo: input.titulo,
      descricao: input.descricao || null,
      blocoId: input.blocoId,
      nivel: nivelDoBloco(input.blocoId),
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
      blocoId: input.blocoId,
      nivel: nivelDoBloco(input.blocoId),
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
