"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { BLOCOS_INFO } from "@/data/blocos";
import { ESTADOS } from "@/data/estados";
import type { ContentType, UF } from "@/lib/types";
import type { FormState } from "./actions";

export interface ConteudoDefaults {
  titulo?: string;
  descricao?: string;
  blocoId?: string;
  tipo?: ContentType;
  url?: string;
  prova?: string;
  estados?: UF[];
  thumbnail?: string;
  duracaoMin?: number;
}

const estadoInicial: FormState = { ok: false };

export default function ConteudoForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: ConteudoDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);
  const [tipo, setTipo] = useState<ContentType>(defaults.tipo ?? "youtube");
  const erros = state.erros ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {/* Título */}
      <Campo label="Título" erro={erros.titulo} htmlFor="titulo">
        <input
          id="titulo"
          name="titulo"
          type="text"
          defaultValue={defaults.titulo}
          placeholder="Ex.: Ultra Revisão R1 — Clínica Médica"
          className="input"
        />
      </Campo>

      {/* Bloco */}
      <Campo label="Bloco / categoria" erro={erros.blocoId} htmlFor="blocoId">
        <select
          id="blocoId"
          name="blocoId"
          defaultValue={defaults.blocoId ?? ""}
          className="input"
          onChange={(e) => {
            const b = BLOCOS_INFO.find((x) => x.id === e.target.value);
            if (b) setTipo(b.tipoPadrao);
          }}
        >
          <option value="" disabled>
            Selecione um bloco
          </option>
          {BLOCOS_INFO.map((b) => (
            <option key={b.id} value={b.id}>
              {b.titulo}
            </option>
          ))}
        </select>
      </Campo>

      {/* Tipo */}
      <Campo label="Tipo de conteúdo" erro={erros.tipo} htmlFor="">
        <div className="flex gap-2">
          {(["youtube", "arquivo"] as ContentType[]).map((t) => (
            <label
              key={t}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                tipo === t
                  ? "border-teal bg-teal/15 text-teal"
                  : "border-border bg-surface text-muted"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              {t === "youtube" ? "🎥 Vídeo (YouTube)" : "📄 Arquivo (download)"}
            </label>
          ))}
        </div>
      </Campo>

      {/* URL */}
      <Campo
        label={tipo === "youtube" ? "Link do vídeo (YouTube)" : "Link do arquivo"}
        erro={erros.url}
        htmlFor="url"
      >
        <input
          id="url"
          name="url"
          type="url"
          defaultValue={defaults.url}
          placeholder={
            tipo === "youtube"
              ? "https://www.youtube.com/watch?v=..."
              : "https://.../arquivo.pdf"
          }
          className="input"
        />
      </Campo>

      {/* Prova + Duração */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Prova (opcional)" erro={erros.prova} htmlFor="prova">
          <input
            id="prova"
            name="prova"
            type="text"
            defaultValue={defaults.prova}
            placeholder="Ex.: USP-SP, ENARE"
            className="input"
          />
        </Campo>
        <Campo
          label="Duração em min (opcional)"
          erro={erros.duracaoMin}
          htmlFor="duracaoMin"
        >
          <input
            id="duracaoMin"
            name="duracaoMin"
            type="number"
            min={1}
            defaultValue={defaults.duracaoMin}
            placeholder="Ex.: 90"
            className="input"
          />
        </Campo>
      </div>

      {/* Estados */}
      <Campo
        label="Estados (deixe vazio = conteúdo nacional)"
        erro={erros.estados}
        htmlFor=""
      >
        <div className="no-scrollbar flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-surface p-3">
          {ESTADOS.map((e) => {
            const marcado = defaults.estados?.includes(e.uf) ?? false;
            return (
              <label
                key={e.uf}
                title={e.nome}
                className="relative cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="estados"
                  value={e.uf}
                  defaultChecked={marcado}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted transition-colors peer-checked:border-teal peer-checked:bg-teal peer-checked:text-black">
                  {e.uf}
                </span>
              </label>
            );
          })}
        </div>
      </Campo>

      {/* Thumbnail */}
      <Campo
        label="Imagem de capa (opcional)"
        erro={erros.thumbnail}
        htmlFor="thumbnail"
      >
        <input
          id="thumbnail"
          name="thumbnail"
          type="url"
          defaultValue={defaults.thumbnail}
          placeholder="https://... (vídeos do YouTube geram capa automática)"
          className="input"
        />
      </Campo>

      {/* Descrição */}
      <Campo label="Descrição (opcional)" erro={erros.descricao} htmlFor="descricao">
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={defaults.descricao}
          placeholder="Breve descrição do conteúdo."
          className="input resize-none"
        />
      </Campo>

      {/* Ações */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin"
          className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-semibold text-muted hover:text-foreground"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  erro,
  htmlFor,
  children,
}: {
  label: string;
  erro?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor || undefined}
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      {children}
      {erro && <p className="mt-1 text-xs text-error">{erro}</p>}
    </div>
  );
}
