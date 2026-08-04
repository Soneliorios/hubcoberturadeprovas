"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cadastroSchema } from "@/lib/cadastro-schema";
import {
  salvarLead,
  marcarCadastrado,
  buscarLeadPorEmail,
} from "@/server/leads";

/** Valores ecoados de volta ao formulário quando a validação falha
 *  (o React 19 reseta forms após a action — sem isso o visitante perderia tudo). */
export interface CadastroValores {
  nome: string;
  email: string;
  telefone: string;
  provas: string[];
}

export interface CadastroState {
  ok: boolean;
  erros?: Record<string, string>;
  valores?: CadastroValores;
}

/** Aceita apenas caminhos internos como destino pós-cadastro. */
function destinoSeguro(voltar: string): string {
  if (voltar.startsWith("/") && !voltar.startsWith("//")) return voltar;
  return "/conteudos";
}

export async function cadastrarAction(
  _prev: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  // Honeypot anti-bot: campo invisível que humanos não preenchem.
  if (String(formData.get("site") ?? "") !== "") {
    redirect("/conteudos");
  }

  const valores: CadastroValores = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    provas: formData.getAll("provas").map(String),
  };

  const parsed = cadastroSchema.safeParse(valores);

  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const campo = i.path[0] != null ? String(i.path[0]) : "form";
      if (!erros[campo]) erros[campo] = i.message;
    }
    return { ok: false, erros, valores };
  }

  // TODO: enviar também ao CRM (RD Station / HubSpot) quando definido.
  const lead = await salvarLead(parsed.data);
  await marcarCadastrado(lead.id);

  revalidatePath("/conteudos");
  const destino = destinoSeguro(String(formData.get("voltar") ?? "/conteudos"));
  redirect(`${destino}?cadastro=ok`);
}

/* ===== Entrar (quem já se cadastrou em outro navegador/dispositivo) ===== */

export interface EntrarState {
  ok: boolean;
  erro?: string;
  /** Eco do e-mail digitado (React 19 reseta o form após a action). */
  email?: string;
}

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Informe um e-mail válido.");

export async function entrarAction(
  _prev: EntrarState,
  formData: FormData
): Promise<EntrarState> {
  // Honeypot anti-bot.
  if (String(formData.get("site") ?? "") !== "") {
    redirect("/conteudos");
  }

  const emailBruto = String(formData.get("email") ?? "");
  const parsed = emailSchema.safeParse(emailBruto);
  if (!parsed.success) {
    return { ok: false, erro: "Informe um e-mail válido.", email: emailBruto };
  }

  const lead = await buscarLeadPorEmail(parsed.data);
  if (!lead) {
    return {
      ok: false,
      erro:
        "Não encontramos esse e-mail. Confira se digitou certo ou faça seu cadastro.",
      email: emailBruto,
    };
  }

  await marcarCadastrado(lead.id);
  revalidatePath("/conteudos");
  const destino = destinoSeguro(String(formData.get("voltar") ?? "/conteudos"));
  redirect(`${destino}?cadastro=login`);
}
