"use client";

import { useMemo, useState } from "react";
import type { Nivel, SecaoComConteudos, UF } from "@/lib/types";
import { ESTADOS } from "@/data/estados";
import { filtrarItens } from "@/lib/filtro";
import Filtros from "./Filtros";
import ContentCarousel from "./ContentCarousel";
import SecaoBloqueada from "./SecaoBloqueada";

/**
 * Conteúdo interativo da home: filtros (nível + estado) + seções.
 * Seções bloqueadas (exclusivas para cadastrados) aparecem borradas com CTA —
 * elas respondem ao filtro de nível, mas não somem com o filtro de estado
 * (os itens não estão no navegador; a vitrine continua convidando ao cadastro).
 */
export default function HubContent({ secoes }: { secoes: SecaoComConteudos[] }) {
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [uf, setUf] = useState<UF | null>(null);

  const visiveis = useMemo(
    () =>
      secoes
        .filter(({ secao }) => !nivel || secao.nivel === nivel)
        .map((s) => ({
          ...s,
          itensFiltrados: s.bloqueada ? [] : filtrarItens(s.itens, uf),
        }))
        // Seção bloqueada só aparece se tem conteúdo real por trás —
        // nunca prometer desbloqueio de uma seção vazia. Seção mista
        // permanece visível pelo bloco de restritos mesmo sob filtro de UF.
        .filter((s) =>
          s.bloqueada
            ? s.total > 0
            : s.itensFiltrados.length > 0 || s.bloqueados > 0
        ),
    [secoes, nivel, uf]
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

      {visiveis.length === 0 ? (
        <div className="px-4 py-16 text-center text-muted sm:px-6">
          Nenhum conteúdo encontrado para esses filtros ainda.
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {visiveis.map((s) =>
            s.bloqueada ? (
              // Com filtro de UF ativo, omitimos a contagem (total ≠ filtrado)
              <SecaoBloqueada
                key={s.secao.id}
                secao={s.secao}
                total={uf ? 0 : s.total}
              />
            ) : (
              <ContentCarousel
                key={s.secao.id}
                secao={s.secao}
                itens={s.itensFiltrados}
                bloqueados={s.bloqueados}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
