"use client";

import { useMemo, useState } from "react";
import type { ContentBlock, Nivel, UF } from "@/lib/types";
import { ESTADOS } from "@/data/estados";
import { filtrarItens } from "@/lib/filtro";
import Filtros from "./Filtros";
import ContentCarousel from "./ContentCarousel";

/** Conteúdo interativo da home: filtros (nível + estado) + blocos em carrossel. */
export default function HubContent({ blocos }: { blocos: ContentBlock[] }) {
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [uf, setUf] = useState<UF | null>(null);

  const blocosFiltrados = useMemo(
    () =>
      blocos
        // filtro de nível: R1 (Acesso Direto) ou R+ (Especialidade)
        .filter((bloco) => !nivel || bloco.nivel === nivel)
        // filtro de estado: aplicado aos itens de cada bloco
        .map((bloco) => ({ bloco, itens: filtrarItens(bloco.itens, uf) }))
        .filter((b) => b.itens.length > 0),
    [blocos, nivel, uf]
  );

  const nomeEstado = uf ? ESTADOS.find((e) => e.uf === uf)?.nome : null;
  const temFiltro = nivel !== null || uf !== null;

  return (
    <div className="mx-auto w-full max-w-[1400px] py-6">
      <div className="mb-4">
        <Filtros nivel={nivel} uf={uf} onNivel={setNivel} onUf={setUf} />
      </div>

      {temFiltro && (
        <div className="mb-2 flex flex-wrap items-center gap-2 px-4 text-sm text-muted sm:px-6">
          <span>
            {nivel === "R1" && "Acesso Direto (R1)"}
            {nivel === "R+" && "Especialidade (R+)"}
            {nivel && nomeEstado && " · "}
            {nomeEstado && (
              <>
                Conteúdos de{" "}
                <span className="font-semibold text-foreground">{nomeEstado}</span> e
                nacionais
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              setNivel(null);
              setUf(null);
            }}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted hover:border-teal/50 hover:text-foreground"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {blocosFiltrados.length === 0 ? (
        <div className="px-4 py-16 text-center text-muted sm:px-6">
          Nenhum conteúdo encontrado para esses filtros ainda.
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {blocosFiltrados.map(({ bloco, itens }) => (
            <ContentCarousel key={bloco.id} bloco={bloco} itens={itens} />
          ))}
        </div>
      )}
    </div>
  );
}
