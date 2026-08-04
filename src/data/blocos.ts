import type { ContentType, Nivel } from "@/lib/types";

/** Metadados de um bloco/categoria fixo do hub. */
export interface BlocoInfo {
  id: string;
  titulo: string;
  nivel: Nivel;
  icone?: string;
  /** Tipo predominante de conteúdo do bloco */
  tipoPadrao: ContentType;
}

/**
 * Os 6 blocos são fixos (definidos no escopo). O admin cadastra conteúdos e
 * associa cada um a um destes blocos. Para adicionar/renomear blocos no futuro,
 * basta editar esta lista.
 */
export const BLOCOS_INFO: BlocoInfo[] = [
  { id: "ultra-revisao-r1", titulo: "Ultra Revisão R1", nivel: "R1", icone: "⚡", tipoPadrao: "youtube" },
  { id: "ultra-revisao-rmais", titulo: "Ultra Revisão R+", nivel: "R+", icone: "⚡", tipoPadrao: "youtube" },
  { id: "previsoes-medbrain-r1", titulo: "Previsões Medbrain R1", nivel: "R1", icone: "🧠", tipoPadrao: "arquivo" },
  { id: "previsoes-medbrain-rmais", titulo: "Previsões Medbrain R+", nivel: "R+", icone: "🧠", tipoPadrao: "arquivo" },
  { id: "lives-correcao-r1", titulo: "Lives de Correção R1", nivel: "R1", icone: "🎥", tipoPadrao: "youtube" },
  { id: "lives-correcao-rmais", titulo: "Lives de Correção R+", nivel: "R+", icone: "🎥", tipoPadrao: "youtube" },
];

export function getBloco(id: string): BlocoInfo | undefined {
  return BLOCOS_INFO.find((b) => b.id === id);
}
