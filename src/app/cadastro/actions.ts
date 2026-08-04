"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cadastroSchema } from "@/lib/cadastro-schema";
import { salvarLead, marcarCadastrado } from "@/server/leads";

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
