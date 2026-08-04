import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { CadastroInput } from "@/lib/cadastro-schema";
import type { Lead } from "@prisma/client";

/** Cookie que marca o navegador como "cadastrado" (destrava as seções). */
export const CADASTRO_COOKIE = "ccp_cadastrado";
const UM_ANO_S = 60 * 60 * 24 * 365;

/** Salva (ou atualiza, pelo e-mail) o lead do cadastro. */
export async function salvarLead(input: CadastroInput): Promise<Lead> {
  return prisma.lead.upsert({
    where: { email: input.email },
    update: {
      nome: input.nome,
      telefone: input.telefone,
      provas: JSON.stringify(input.provas),
    },
    create: {
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      provas: JSON.stringify(input.provas),
    },
  });
}

/** Marca o navegador como cadastrado (cookie httpOnly de 1 ano). */
export async function marcarCadastrado(leadId: string): Promise<void> {
  const store = await cookies();
  store.set(CADASTRO_COOKIE, leadId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: UM_ANO_S,
    path: "/",
  });
}

/** O visitante desta requisição já se cadastrou? (gate suave, por cookie) */
export async function estaCadastrado(): Promise<boolean> {
  const store = await cookies();
  return !!store.get(CADASTRO_COOKIE)?.value;
}

/** Lista leads (mais recentes primeiro) — para futura tela/exportação no admin. */
export async function listarLeads(): Promise<Lead[]> {
  return prisma.lead.findMany({ orderBy: { criadoEm: "desc" } });
}
