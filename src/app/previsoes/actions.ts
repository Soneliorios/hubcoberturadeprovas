"use server";

import { revalidatePath } from "next/cache";
import { getLeadIdAtual } from "@/server/leads";
import { registrarVoto } from "@/server/previsoes";

export interface VotoResultado {
  ok: boolean;
  /** true = precisa se cadastrar para votar */
  precisaCadastro?: boolean;
  motivo?: string;
  votosSim?: number;
  votosTotal?: number;
  pctSim?: number;
  meuVoto?: boolean | null;
}

/**
 * Registra o voto do visitante. `voto`:
 *  - true  = "vai cair"
 *  - false = "não vai cair"
 *  - null  = remover o voto (clicou de novo no mesmo)
 * Só quem tem cadastro (cookie de lead) pode votar.
 */
export async function votarAction(
  previsaoId: string,
  voto: boolean | null,
  provaId: string
): Promise<VotoResultado> {
  const leadId = await getLeadIdAtual();
  if (!leadId) return { ok: false, precisaCadastro: true };

  const res = await registrarVoto(previsaoId, leadId, voto);
  if (!res.ok) return { ok: false, motivo: res.motivo };

  // Recalcula o agregado da previsão para devolver ao cliente na hora.
  const { prisma } = await import("@/lib/prisma");
  const [total, sim] = await Promise.all([
    prisma.voto.count({ where: { previsaoId } }),
    prisma.voto.count({ where: { previsaoId, voto: true } }),
  ]);

  revalidatePath(`/previsoes/${provaId}`);
  return {
    ok: true,
    votosSim: sim,
    votosTotal: total,
    pctSim: total > 0 ? Math.round((sim / total) * 100) : 0,
    meuVoto: voto,
  };
}
