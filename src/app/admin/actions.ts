"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { conteudoSchema } from "@/lib/conteudo-schema";
import {
  criarConteudo,
  atualizarConteudo,
  excluirConteudo,
} from "@/server/conteudos";

/** Valores brutos ecoados de volta ao formulário em erro de validação
 *  (o React 19 reseta o form após a action — sem isso o admin perderia as edições). */
export interface ConteudoValores {
  titulo: string;
  descricao: string;
  secaoId: string;
  tipo: string;
  url: string;
  prova: string;
  estados: string[];
  thumbnail: string;
  duracaoMin: string;
}

export interface FormState {
  ok: boolean;
  erros?: Record<string, string>;
  valores?: ConteudoValores;
  mensagem?: string;
}

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autorizado.");
  }
}

function lerValores(formData: FormData): ConteudoValores {
  return {
    titulo: String(formData.get("titulo") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    secaoId: String(formData.get("secaoId") ?? ""),
    tipo: String(formData.get("tipo") ?? "youtube"),
    url: String(formData.get("url") ?? ""),
    prova: String(formData.get("prova") ?? ""),
    estados: formData.getAll("estados").map(String),
    thumbnail: String(formData.get("thumbnail") ?? ""),
    duracaoMin: String(formData.get("duracaoMin") ?? "").trim(),
  };
}

/** Lê e valida os campos do FormData do formulário de conteúdo. */
function parseForm(valores: ConteudoValores) {
  return conteudoSchema.safeParse({
    ...valores,
    duracaoMin: valores.duracaoMin === "" ? undefined : valores.duracaoMin,
  });
}

function coletarErros(
  issues: readonly { path: readonly PropertyKey[]; message: string }[]
): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const i of issues) {
    const campo = i.path[0] != null ? String(i.path[0]) : "form";
    if (!erros[campo]) erros[campo] = i.message;
  }
  return erros;
}

/** FK violada = a seção foi excluída por outro admin entre o load e o submit. */
function ehErroDeSecao(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    (e.code === "P2003" || e.code === "P2025")
  );
}

const ERRO_SECAO = {
  secaoId: "Essa seção não existe mais. Recarregue a página e tente novamente.",
};

export async function criarConteudoAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await exigirAdmin();
  const valores = lerValores(formData);
  const parsed = parseForm(valores);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues), valores };
  }
  try {
    await criarConteudo(parsed.data);
  } catch (e) {
    if (ehErroDeSecao(e)) return { ok: false, erros: ERRO_SECAO, valores };
    throw e;
  }
  revalidatePath("/admin");
  revalidatePath("/conteudos");
  redirect("/admin?ok=criado");
}

export async function atualizarConteudoAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await exigirAdmin();
  const valores = lerValores(formData);
  const parsed = parseForm(valores);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues), valores };
  }
  try {
    await atualizarConteudo(id, parsed.data);
  } catch (e) {
    if (ehErroDeSecao(e)) return { ok: false, erros: ERRO_SECAO, valores };
    throw e;
  }
  revalidatePath("/admin");
  revalidatePath("/conteudos");
  redirect("/admin?ok=atualizado");
}

export async function excluirConteudoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try {
    await excluirConteudo(id);
  } catch (e) {
    // Já excluído (duplo clique / outra aba): considera feito.
    if (
      !(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
    ) {
      throw e;
    }
  }
  revalidatePath("/admin");
  revalidatePath("/conteudos");
}
