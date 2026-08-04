"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { conteudoSchema } from "@/lib/conteudo-schema";
import {
  criarConteudo,
  atualizarConteudo,
  excluirConteudo,
} from "@/server/conteudos";

export interface FormState {
  ok: boolean;
  erros?: Record<string, string>;
  mensagem?: string;
}

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autorizado.");
  }
}

/** Lê e valida os campos do FormData do formulário de conteúdo. */
function parseForm(formData: FormData) {
  const estados = formData.getAll("estados").map(String);
  const duracaoRaw = String(formData.get("duracaoMin") ?? "").trim();

  return conteudoSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") ?? "",
    blocoId: formData.get("blocoId"),
    tipo: formData.get("tipo"),
    url: formData.get("url"),
    prova: formData.get("prova") ?? "",
    estados,
    thumbnail: formData.get("thumbnail") ?? "",
    duracaoMin: duracaoRaw === "" ? undefined : duracaoRaw,
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

export async function criarConteudoAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await exigirAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues) };
  }
  await criarConteudo(parsed.data);
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
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues) };
  }
  await atualizarConteudo(id, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/conteudos");
  redirect("/admin?ok=atualizado");
}

export async function excluirConteudoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await excluirConteudo(id);
    revalidatePath("/admin");
    revalidatePath("/conteudos");
  }
}
