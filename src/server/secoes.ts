import "server-only";
import { prisma } from "@/lib/prisma";
import type { Secao } from "@prisma/client";
import type { SecaoInput } from "@/lib/secao-schema";

export type SecaoComContagem = Secao & { _count: { conteudos: number } };

/** Todas as seções na ordem de exibição, com contagem de conteúdos. */
export async function listarSecoes(): Promise<SecaoComContagem[]> {
  return prisma.secao.findMany({
    orderBy: { ordem: "asc" },
    include: { _count: { select: { conteudos: true } } },
  });
}

export async function getSecao(id: string): Promise<Secao | null> {
  return prisma.secao.findUnique({ where: { id } });
}

export async function criarSecao(input: SecaoInput): Promise<Secao> {
  // Nova seção entra no fim da lista.
  const max = await prisma.secao.aggregate({ _max: { ordem: true } });
  return prisma.secao.create({
    data: {
      titulo: input.titulo,
      icone: input.icone || null,
      nivel: input.nivel,
      tipoPadrao: input.tipoPadrao,
      acesso: input.acesso,
      ordem: (max._max.ordem ?? -1) + 1,
    },
  });
}

export async function atualizarSecao(id: string, input: SecaoInput): Promise<Secao> {
  return prisma.secao.update({
    where: { id },
    data: {
      titulo: input.titulo,
      icone: input.icone || null,
      nivel: input.nivel,
      tipoPadrao: input.tipoPadrao,
      acesso: input.acesso,
    },
  });
}

/** Alterna entre "aberto" e "cadastro". */
export async function alternarAcesso(id: string): Promise<void> {
  const s = await prisma.secao.findUnique({ where: { id } });
  if (!s) return;
  await prisma.secao.update({
    where: { id },
    data: { acesso: s.acesso === "aberto" ? "cadastro" : "aberto" },
  });
}

/** Move a seção uma posição para cima ou para baixo (troca de `ordem`). */
export async function moverSecao(id: string, direcao: "cima" | "baixo"): Promise<void> {
  const todas = await prisma.secao.findMany({ orderBy: { ordem: "asc" } });
  const i = todas.findIndex((s) => s.id === id);
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= todas.length) return;
  await prisma.$transaction([
    prisma.secao.update({ where: { id: todas[i].id }, data: { ordem: todas[j].ordem } }),
    prisma.secao.update({ where: { id: todas[j].id }, data: { ordem: todas[i].ordem } }),
  ]);
}

/**
 * Exclui a seção. Retorna false se ela ainda tiver conteúdos
 * (o FK do banco também bloqueia — dupla proteção).
 */
export async function excluirSecao(id: string): Promise<boolean> {
  const total = await prisma.conteudo.count({ where: { secaoId: id } });
  if (total > 0) return false;
  await prisma.secao.delete({ where: { id } });
  return true;
}
