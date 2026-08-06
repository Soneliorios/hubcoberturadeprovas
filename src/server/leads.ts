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

/** Salva o lead vindo do formulário HubSpot (todas as respostas em JSON). */
export async function salvarLeadHubspot(dados: {
  nome: string;
  email: string;
  telefone: string;
  respostas: string;
}): Promise<Lead> {
  return prisma.lead.upsert({
    where: { email: dados.email },
    update: {
      nome: dados.nome,
      telefone: dados.telefone,
      respostas: dados.respostas,
    },
    create: {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      respostas: dados.respostas,
    },
  });
}

/** Marca que o lead foi sincronizado com a HubSpot. */
export async function marcarHubspotSincronizado(id: string): Promise<void> {
  await prisma.lead.update({ where: { id }, data: { hubspotEm: new Date() } });
}

/** Busca um lead pelo e-mail (usado no "entrar" de quem já se cadastrou). */
export async function buscarLeadPorEmail(email: string): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { email } });
}

/** O visitante desta requisição já se cadastrou? (gate suave, por cookie) */
/**
 * Id do lead do visitante atual (do cookie), ou null.
 * Valida que o lead ainda existe no banco (cookie órfão → null).
 */
export async function getLeadIdAtual(): Promise<string | null> {
  const store = await cookies();
  const id = store.get(CADASTRO_COOKIE)?.value;
  if (!id) return null;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  return lead?.id ?? null;
}

/** Está cadastrado? Consistente com a votação: exige lead válido no banco
 *  (cookie apontando para lead inexistente NÃO conta como cadastrado). */
export async function estaCadastrado(): Promise<boolean> {
  return (await getLeadIdAtual()) !== null;
}

/** Lista leads (mais recentes primeiro) — para futura tela/exportação no admin. */
export async function listarLeads(): Promise<Lead[]> {
  return prisma.lead.findMany({ orderBy: { criadoEm: "desc" } });
}
