import type { ContentItem, UF } from "@/lib/types";

/**
 * Um item aparece quando:
 * - nenhum estado está selecionado (mostra tudo), ou
 * - o item é nacional (sem `estados`), ou
 * - o item inclui o estado selecionado.
 */
export function itemVisivel(item: ContentItem, uf: UF | null): boolean {
  if (!uf) return true;
  if (!item.estados || item.estados.length === 0) return true;
  return item.estados.includes(uf);
}

export function filtrarItens(itens: ContentItem[], uf: UF | null): ContentItem[] {
  return itens.filter((i) => itemVisivel(i, uf));
}
