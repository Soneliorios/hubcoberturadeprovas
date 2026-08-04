"use client";

import { useEffect, useRef, useState } from "react";
import type { Notificacao } from "@/lib/types";

function formatarData(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotificationBell({
  notificacoes,
}: {
  notificacoes: Notificacao[];
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  // Fecha ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label="Notificações"
        aria-expanded={aberto}
        className="relative grid place-items-center h-10 w-10 rounded-full text-foreground/90 hover:bg-surface-2 transition-colors"
      >
        {/* Ícone de sino */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-teal text-[10px] font-bold text-black">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Notificações</p>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted text-center">
                Nenhuma notificação por enquanto.
              </li>
            )}
            {notificacoes.map((n) => (
              <li
                key={n.id}
                className="px-4 py-3 border-b border-border/60 last:border-0 hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-start gap-2">
                  {!n.lida && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-teal shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.titulo}</p>
                    {n.descricao && (
                      <p className="text-xs text-muted mt-0.5">{n.descricao}</p>
                    )}
                    <p className="text-[11px] text-muted/70 mt-1">
                      {formatarData(n.data)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
