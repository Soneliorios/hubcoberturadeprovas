"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption<T extends string> {
  value: T | null;
  label: string;
  /** Texto auxiliar à direita (ex.: sigla) */
  hint?: string;
}

/** Dropdown acessível e estilizado (dark) para seleção única. */
export default function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: T | null;
  options: DropdownOption<T>[];
  onChange: (value: T | null) => void;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selecionada =
    options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            value
              ? "border-teal/60 bg-surface text-foreground"
              : "border-border bg-surface text-foreground hover:border-teal/50"
          }`}
        >
          <span className="truncate">{selecionada?.label}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`shrink-0 text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {aberto && (
          <ul
            role="listbox"
            className="no-scrollbar absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-2xl"
          >
            {options.map((o) => {
              const ativo = o.value === value;
              return (
                <li key={o.value ?? "__todos"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    onClick={() => {
                      onChange(o.value);
                      setAberto(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      ativo
                        ? "bg-teal/15 font-semibold text-teal"
                        : "text-foreground hover:bg-surface-2"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.hint && (
                      <span className="shrink-0 text-xs text-muted">{o.hint}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
