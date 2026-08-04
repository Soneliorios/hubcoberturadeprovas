"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { preload } from "react-dom";

/**
 * Intro estilo Netflix exibida a cada inicialização/refresh do app.
 *
 * Sequência (CSS puro, keyframes em globals.css):
 *  1. "med" (metade branca do logo) surge centralizado com zoom cinematográfico.
 *  2. "way" (metade verde) desliza de trás do "med" para a direita, enquanto
 *     o conjunto se recentraliza — formando o logo completo.
 *  3. Brilho teal sutil e fade-out revelando o app.
 *
 * Técnica: o PNG oficial (fundo transparente) é usado em duas camadas.
 *  - MED: clip-path mostrando a metade esquerda.
 *  - WAY: uma "janela" com overflow hidden sobre a metade direita; dentro dela
 *    o logo (200% da janela, ancorado à direita) começa deslocado para a
 *    esquerda (escondido pela janela) e desliza até a posição original.
 *  O corte em 50% cai no espaço entre as letras (medido no arquivo:
 *  branco termina em 48,6%, verde começa em 51,3%).
 *
 * Decisões (validadas em code review adversarial):
 *  - Visibilidade decidida UMA vez no mount (não por render): load em /admin
 *    nunca mostra a intro, nem ao navegar de lá para o site.
 *  - Clique ou Esc pulam a intro (fade rápido via .intro-skip).
 *  - prefers-reduced-motion é tratado no CSS (media query), independente de JS.
 *  - preload + fetchPriority="high" garantem o logo no início da timeline.
 */
export default function IntroSplash() {
  const pathname = usePathname();
  // Decidido uma única vez por carga completa da página (initializer roda no
  // primeiro render; igual no SSR e na hidratação — sem mismatch).
  const [visivel, setVisivel] = useState(() => !pathname.startsWith("/admin"));
  const [pulando, setPulando] = useState(false);

  useEffect(() => {
    if (!visivel) return;
    // O CSS já esconde via media query; aqui apenas limpamos o DOM.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisivel(false);
      return;
    }
    const pular = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") setPulando(true);
    };
    window.addEventListener("keydown", pular);
    // Fallback de remoção caso onAnimationEnd não dispare.
    const t = setTimeout(() => setVisivel(false), 4200);
    return () => {
      window.removeEventListener("keydown", pular);
      clearTimeout(t);
    };
  }, [visivel]);

  if (!visivel) return null;

  // Emite <link rel="preload"> no HTML inicial (SSR) — o logo é o único
  // conteúdo da intro e precisa chegar antes da timeline CSS.
  preload("/brand/medway-logo.png", { as: "image", fetchPriority: "high" });

  return (
    <div
      aria-hidden
      className={`intro-overlay fixed inset-0 z-[100] grid place-items-center bg-[#0b0b0c] ${
        pulando ? "intro-skip" : ""
      }`}
      onClick={() => setPulando(true)}
      onAnimationEnd={(e) => {
        if (e.animationName === "intro-fade-out") setVisivel(false);
      }}
    >
      {/* Brilho teal atrás do logo */}
      <div className="intro-glow absolute h-[60vmin] w-[60vmin] rounded-full" />

      {/* Caixa do logo: zoom + recentralização */}
      <div
        className="intro-box relative w-[min(72vw,520px)]"
        style={{ aspectRatio: "1100 / 224" }}
      >
        {/* MED — metade esquerda (branca) */}
        <img
          src="/brand/medway-logo.png"
          alt=""
          fetchPriority="high"
          className="intro-med absolute inset-0 h-full w-full"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />

        {/* WAY — janela sobre a metade direita; o logo desliza dentro dela */}
        <div className="absolute inset-y-0 left-1/2 right-0 overflow-hidden">
          <img
            src="/brand/medway-logo.png"
            alt=""
            className="intro-way absolute right-0 top-0 h-full w-[200%] max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
