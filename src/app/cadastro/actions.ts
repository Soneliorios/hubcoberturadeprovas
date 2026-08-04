"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { cadastroSchema } from "@/lib/cadastro-schema";
import {
  salvarLead,
  salvarLeadHubspot,
  marcarCadastrado,
  marcarHubspotSincronizado,
  buscarLeadPorEmail,
} from "@/server/leads";
import { getFormularioHubspot, enviarParaHubspot } from "@/server/hubspot";
import {
  validarRespostas,
  respostasVisiveis,
  type ValoresHs,
} from "@/lib/hubspot-form";

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

/* ===== Cadastro via formulário HubSpot (dinâmico, com lógica condicional) ===== */

export interface HsFormState {
  ok: boolean;
  /** { nomeDoCampo: mensagem } — "form" para erro geral */
  erros?: Record<string, string>;
}

export async function cadastrarHubspotAction(
  _prev: HsFormState,
  formData: FormData
): Promise<HsFormState> {
  // Honeypot anti-bot.
  if (String(formData.get("site") ?? "") !== "") {
    redirect("/conteudos");
  }

  let valores: ValoresHs;
  let extras: Record<string, string> = {};
  try {
    valores = JSON.parse(String(formData.get("payload") ?? "{}"));
    extras = JSON.parse(String(formData.get("extras") ?? "{}"));
  } catch {
    return { ok: false, erros: { form: "Envio inválido. Recarregue a página." } };
  }

  // Revalida TUDO no servidor (visibilidade condicional + obrigatórios).
  const form = await getFormularioHubspot();
  const erros = validarRespostas(form, valores);
  if (Object.keys(erros).length > 0) {
    return { ok: false, erros };
  }
  const respostas = respostasVisiveis(form, valores);

  const email = String(respostas.email ?? "").toLowerCase();
  if (!email) {
    return { ok: false, erros: { email: "Informe um e-mail válido." } };
  }
  const nome = [respostas.firstname, respostas.lastname]
    .filter(Boolean)
    .join(" ")
    .slice(0, 200);
  const telefone = String(respostas.phone ?? "").slice(0, 30);

  // 1) Nossa base — sempre, mesmo se a HubSpot falhar.
  const lead = await salvarLeadHubspot({
    nome: nome || email,
    email,
    telefone,
    respostas: JSON.stringify(respostas),
  });

  // 2) HubSpot — submissão de formulário (respeita as condicionais). O hutk
  //    do rastreamento associa a submissão à navegação (atribuição de origem).
  try {
    const store = await cookies();
    await enviarParaHubspot(form, respostas, {
      hutk: store.get("hubspotutk")?.value,
      pageUri: extras.pageUri,
      pageName: "Central Cobertura de Provas — Cadastro",
    });
    await marcarHubspotSincronizado(lead.id);
  } catch (e) {
    // Lead está salvo na nossa base (hubspotEm = null permite reprocessar).
    console.error("[hubspot] falha ao sincronizar lead:", e);
  }

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
