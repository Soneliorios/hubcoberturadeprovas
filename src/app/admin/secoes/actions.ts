"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { secaoSchema } from "@/lib/secao-schema";
import {
  criarSecao,
  atualizarSecao,
  excluirSecao,
  alternarAcesso,
  moverSecao,
} from "@/server/secoes";

/** Valores brutos ecoados de volta ao formulário em erro de validação. */
export interface SecaoValores {
  titulo: string;
  icone: string;
  nivel: string;
  tipoPadrao: string;
  acesso: string;
}

export interface SecaoFormState {
  ok: boolean;
  erros?: Record<string, string>;
  valores?: SecaoValores;
  mensagem?: string;
}

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");
}

function revalidarTudo() {
  revalidatePath("/admin/secoes");
  revalidatePath("/admin");
  revalidatePath("/conteudos");
}

function lerValores(formData: FormData): SecaoValores {
  return {
    titulo: String(formData.get("titulo") ?? ""),
    icone: String(formData.get("icone") ?? ""),
    nivel: String(formData.get("nivel") ?? "R1"),
    tipoPadrao: String(formData.get("tipoPadrao") ?? "youtube"),
    acesso: String(formData.get("acesso") ?? "aberto"),
  };
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

function ehRegistroSumiu(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025"
  );
}

export async function criarSecaoAction(
  _prev: SecaoFormState,
  formData: FormData
): Promise<SecaoFormState> {
  await exigirAdmin();
  const valores = lerValores(formData);
  const parsed = secaoSchema.safeParse(valores);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues), valores };
  }
  await criarSecao(parsed.data);
  revalidarTudo();
  return { ok: true, mensagem: `Seção "${parsed.data.titulo}" criada.` };
}

export async function atualizarSecaoAction(
  id: string,
  _prev: SecaoFormState,
  formData: FormData
): Promise<SecaoFormState> {
  await exigirAdmin();
  const valores = lerValores(formData);
  const parsed = secaoSchema.safeParse(valores);
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues), valores };
  }
  try {
    await atualizarSecao(id, parsed.data);
  } catch (e) {
    if (ehRegistroSumiu(e)) {
      return {
        ok: false,
        erros: { form: "Essa seção não existe mais. Volte e recarregue a lista." },
        valores,
      };
    }
    throw e;
  }
  revalidarTudo();
  redirect("/admin/secoes?ok=atualizada");
}

export async function alternarAcessoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await alternarAcesso(id);
    revalidarTudo();
  }
}

export async function moverSecaoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const direcao = formData.get("direcao") === "cima" ? "cima" : "baixo";
  if (id) {
    await moverSecao(id, direcao);
    revalidarTudo();
  }
}

export async function excluirSecaoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try {
    await excluirSecao(id); // retorna false (não exclui) se houver conteúdos
  } catch (e) {
    // Já excluída em outra aba: considera feito.
    if (!ehRegistroSumiu(e)) throw e;
  }
  revalidarTudo();
}
