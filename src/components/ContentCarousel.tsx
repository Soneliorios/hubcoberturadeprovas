"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ContentBlock, ContentItem } from "@/lib/types";
import ContentCard from "./ContentCard";

/** Bloco/categoria: título + CTA "ver todos" + carrossel com scroll horizontal. */
export default function ContentCarousel({
  bloco,
  itens,
}: {
  bloco: ContentBlock;
  itens: ContentItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (itens.length === 0) return null;

  return (
    <section className="py-4">
      {/* Cabeçalho do bloco */}
      <div className="mb-3 flex items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          {bloco.icone && <span aria-hidden>{bloco.icone}</span>}
          {bloco.titulo}
        </h2>

        <div className="flex items-center gap-1">
          {/* Setas (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Anterior"
              className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Próximo"
              className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* CTA ver todos */}
          <Link
            href={`/conteudos/${bloco.id}`}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-teal hover:bg-teal/10 transition-colors"
          >
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Carrossel */}
      <div
        ref={scrollRef}
        className="carousel no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
      >
        {itens.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
