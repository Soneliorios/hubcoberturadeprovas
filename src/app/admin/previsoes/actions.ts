"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  criarProva,
  atualizarProva,
  definirStatusProva,
  excluirProva,
  criarPrevisao,
  atualizarPrevisao,
  definirResultado,
  excluirPrevisao,
} from "@/server/previsoes";
import type { ProvaStatus } from "@/lib/previsoes-types";

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");
}

function revalidar(provaId?: string) {
  revalidatePath("/admin/previsoes");
  if (provaId) revalidatePath(`/admin/previsoes/${provaId}`);
  revalidatePath("/previsoes");
  if (provaId) revalidatePath(`/previsoes/${provaId}`);
}

function parseData(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/* ------- Provas ------- */

export async function criarProvaAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 3) return;
  const prova = await criarProva({
    nome,
    estado: String(formData.get("estado") ?? "").trim() || undefined,
    nivel: String(formData.get("nivel") ?? "").trim() || undefined,
    dataProva: parseData(formData.get("dataProva")),
  });
  revalidar(prova.id);
  redirect(`/admin/previsoes/${prova.id}`);
}

export async function atualizarProvaAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!id || nome.length < 3) return;
  await atualizarProva(id, {
    nome,
    estado: String(formData.get("estado") ?? "").trim() || undefined,
    nivel: String(formData.get("nivel") ?? "").trim() || undefined,
    dataProva: parseData(formData.get("dataProva")),
  });
  revalidar(id);
}

export async function definirStatusProvaAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ProvaStatus;
  if (!id || !["votacao", "encerrada", "resultado"].includes(status)) return;
  await definirStatusProva(id, status);
  revalidar(id);
}

export async function excluirProvaAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await excluirProva(id);
  revalidar();
  redirect("/admin/previsoes");
}

/* ------- Previsões ------- */

export async function criarPrevisaoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const provaId = String(formData.get("provaId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!provaId || titulo.length < 3) return;
  await criarPrevisao({
    provaId,
    titulo,
    descricao: String(formData.get("descricao") ?? "").trim() || undefined,
    especialidade: String(formData.get("especialidade") ?? "").trim() || undefined,
  });
  revalidar(provaId);
}

export async function atualizarPrevisaoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const provaId = String(formData.get("provaId") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!id || titulo.length < 3) return;
  await atualizarPrevisao(id, {
    titulo,
    descricao: String(formData.get("descricao") ?? "").trim() || undefined,
    especialidade: String(formData.get("especialidade") ?? "").trim() || undefined,
  });
  revalidar(provaId);
}

export async function definirResultadoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const provaId = String(formData.get("provaId") ?? "");
  const v = String(formData.get("caiu") ?? "");
  const caiu = v === "sim" ? true : v === "nao" ? false : null;
  if (!id) return;
  await definirResultado(id, caiu);
  revalidar(provaId);
}

export async function excluirPrevisaoAction(formData: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const provaId = String(formData.get("provaId") ?? "");
  if (!id) return;
  await excluirPrevisao(id);
  revalidar(provaId);
}
