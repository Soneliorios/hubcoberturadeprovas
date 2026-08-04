import Link from "next/link";
import type { SecaoInfo } from "@/lib/types";

/** Card de placeholder (nenhum dado real) exibido borrado sob o overlay. */
function CardFantasma({ video }: { video: boolean }) {
  return (
    <div
      aria-hidden
      className="w-[248px] shrink-0 overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="grid aspect-video place-items-center bg-gradient-to-br from-navy/70 to-surface-2">
        <span className="text-3xl opacity-50">{video ? "🎥" : "📄"}</span>
      </div>
      <div className="space-y-2 p-3">
        <div className="h-4 w-16 rounded-full bg-surface-2" />
        <div className="h-3.5 w-4/5 rounded bg-surface-2" />
        <div className="h-3.5 w-3/5 rounded bg-surface-2" />
      </div>
    </div>
  );
}

/**
 * Seção exclusiva para cadastrados, vista por um visitante sem cadastro:
 * carrossel de placeholders BORRADOS (sem dados reais) + overlay com CTA.
 */
export default function SecaoBloqueada({
  secao,
  total,
}: {
  secao: SecaoInfo;
  total: number;
}) {
  const fantasmas = Math.min(Math.max(total, 3), 6);

  return (
    <section className="py-4">
      {/* Cabeçalho da seção */}
      <div className="mb-3 flex items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          {secao.icone && <span aria-hidden>{secao.icone}</span>}
          {secao.titulo}
          <span className="ml-1 flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Cadastrados
          </span>
        </h2>
      </div>

      {/* Vitrine borrada + overlay (min-h evita o card do CTA transbordar no mobile) */}
      <div className="relative min-h-[290px] px-4 sm:px-6">
        <div className="no-scrollbar pointer-events-none flex select-none gap-4 overflow-hidden pb-2 blur-[6px]">
          {Array.from({ length: fantasmas }, (_, i) => (
            <CardFantasma key={i} video={secao.tipoPadrao === "youtube"} />
          ))}
        </div>

        {/* Overlay com mensagem + CTA */}
        <div className="absolute inset-0 mx-4 grid place-items-center rounded-xl bg-background/40 sm:mx-6">
          <div className="mx-4 flex max-w-sm flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface/95 px-5 py-4 text-center shadow-2xl backdrop-blur sm:gap-3 sm:px-6 sm:py-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal/15 text-teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div>
              <p className="font-bold">Conteúdo exclusivo para cadastrados</p>
              <p className="mt-1 text-sm text-muted">
                Faça seu cadastro gratuito para desbloquear
                {total > 0 ? (
                  <>
                    {" "}
                    {total === 1 ? "o conteúdo" : `os ${total} conteúdos`} de{" "}
                  </>
                ) : (
                  " "
                )}
                <span className="font-semibold text-foreground">{secao.titulo}</span>.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
            >
              Fazer cadastro grátis
            </Link>
            <Link
              href="/cadastro?modo=entrar"
              className="text-xs font-semibold text-muted hover:text-foreground"
            >
              Já tem cadastro? <span className="text-teal">Entrar</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
