import type { ContentItem } from "@/lib/types";
import { getYoutubeThumb } from "@/lib/youtube";

function badgeTipo(tipo: ContentItem["tipo"]) {
  if (tipo === "youtube") {
    return { label: "Vídeo", classe: "bg-error/15 text-error" };
  }
  return { label: "Arquivo", classe: "bg-teal/15 text-teal" };
}

/** Card de um conteúdo. Arquivo abre a página interna de visualização;
 *  vídeo do YouTube abre direto em nova aba. */
export default function ContentCard({ item }: { item: ContentItem }) {
  const thumb =
    item.thumbnail ??
    (item.tipo === "youtube" ? getYoutubeThumb(item.url) : null);
  const badge = badgeTipo(item.tipo);
  const isArquivo = item.tipo === "arquivo";

  return (
    <a
      // Arquivo abre a página interna de visualização (preview + download);
      // vídeo do YouTube abre direto em nova aba.
      href={isArquivo ? `/conteudos/arquivo/${item.id}` : item.url}
      {...(isArquivo ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="group block w-[248px] shrink-0 rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-teal/60 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
    >
      {/* Capa */}
      <div className="relative aspect-video bg-surface-2 overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy to-surface-2">
            <span className="text-3xl opacity-60">
              {item.tipo === "youtube" ? "🎥" : "📄"}
            </span>
          </div>
        )}

        {/* Ícone de play sobre vídeos */}
        {item.tipo === "youtube" && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid place-items-center h-12 w-12 rounded-full bg-black/55 backdrop-blur-sm transition-transform group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        )}

        {/* Duração */}
        {item.duracaoMin != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {item.duracaoMin} min
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.classe}`}
          >
            {badge.label}
          </span>
          {item.prova && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
              {item.prova}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {item.titulo}
        </h3>
        {item.descricao && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{item.descricao}</p>
        )}
      </div>
    </a>
  );
}
