import Link from "next/link";
import type { SecaoInfo } from "@/lib/types";
import CardFantasma from "./CardFantasma";

/**
 * Bloco borrado que representa os conteúdos restritos de uma seção MISTA
 * (que também tem itens abertos). Entra depois dos cards abertos:
 * - `layout="carrossel"`: item horizontal no fim do carrossel da home;
 * - `layout="grade"`: faixa de largura cheia no fim da página "ver todos".
 * Nenhum dado real dos conteúdos restritos chega ao navegador.
 */
export default function ConteudosBloqueadosCTA({
  secao,
  quantidade,
  layout,
  voltar,
}: {
  secao: SecaoInfo;
  quantidade: number;
  layout: "carrossel" | "grade";
  voltar?: string;
}) {
  const fantasmas = layout === "carrossel" ? Math.min(quantidade, 2) : Math.min(quantidade, 4);
  const hrefCadastro = voltar ? `/cadastro?voltar=${voltar}` : "/cadastro";
  const hrefEntrar = voltar
    ? `/cadastro?modo=entrar&voltar=${voltar}`
    : "/cadastro?modo=entrar";

  return (
    <div
      className={
        layout === "carrossel"
          ? "relative min-h-[290px] w-[min(85vw,540px)] shrink-0"
          : "relative min-h-[290px] w-full"
      }
    >
      {/* Fantasmas borrados */}
      <div className="pointer-events-none flex select-none gap-4 overflow-hidden blur-[6px]">
        {Array.from({ length: fantasmas }, (_, i) => (
          <CardFantasma key={i} video={secao.tipoPadrao === "youtube"} />
        ))}
      </div>

      {/* Overlay com CTA */}
      <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/40">
        <div className="mx-3 flex max-w-[300px] flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface/95 px-5 py-4 text-center shadow-2xl backdrop-blur">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal/15 text-teal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold">
              +{quantidade} conteúdo{quantidade === 1 ? "" : "s"} exclusivo
              {quantidade === 1 ? "" : "s"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Cadastre-se grátis para acessar os demais conteúdos de{" "}
              <span className="font-semibold text-foreground">{secao.titulo}</span>.
            </p>
          </div>
          <Link
            href={hrefCadastro}
            className="w-full rounded-lg bg-teal px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
          >
            Fazer cadastro grátis
          </Link>
          <Link
            href={hrefEntrar}
            className="text-[11px] font-semibold text-muted hover:text-foreground"
          >
            Já tem cadastro? <span className="text-teal">Entrar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
