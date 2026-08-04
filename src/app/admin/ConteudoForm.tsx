"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ESTADOS } from "@/data/estados";
import type { ContentType, SecaoInfo, UF } from "@/lib/types";
import type { FormState } from "./actions";

export interface ConteudoDefaults {
  titulo?: string;
  descricao?: string;
  secaoId?: string;
  acesso?: "herdar" | "aberto" | "cadastro";
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
  secoes,
  defaults = {},
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  secoes: SecaoInfo[];
  defaults?: ConteudoDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);
  const [tipo, setTipo] = useState<ContentType>(defaults.tipo ?? "youtube");
  const erros = state.erros ?? {};

  // Após erro de validação o React 19 reseta o form; a action ecoa os valores
  // submetidos em state.valores — usamos como defaults para nada se perder.
  const v = state.valores;
  const d: ConteudoDefaults = v
    ? {
        titulo: v.titulo,
        descricao: v.descricao,
        secaoId: v.secaoId,
        acesso: (["aberto", "cadastro"].includes(v.acesso)
          ? v.acesso
          : "herdar") as "herdar" | "aberto" | "cadastro",
        tipo: (v.tipo === "arquivo" ? "arquivo" : "youtube") as ContentType,
        url: v.url,
        prova: v.prova,
        estados: v.estados as UF[],
        thumbnail: v.thumbnail,
        duracaoMin: v.duracaoMin ? Number(v.duracaoMin) : undefined,
      }
    : defaults;

  return (
    <form action={formAction} className="space-y-6">
      {/* Título */}
      <Campo label="Título" erro={erros.titulo} htmlFor="titulo">
        <input
          id="titulo"
          name="titulo"
          type="text"
          defaultValue={d.titulo}
          placeholder="Ex.: Ultra Revisão R1 — Clínica Médica"
          className="input"
        />
      </Campo>

      {/* Seção */}
      <Campo label="Seção / categoria" erro={erros.secaoId} htmlFor="secaoId">
        <select
          id="secaoId"
          name="secaoId"
          defaultValue={d.secaoId ?? ""}
          className="input"
          onChange={(e) => {
            const s = secoes.find((x) => x.id === e.target.value);
            if (s) setTipo(s.tipoPadrao);
          }}
        >
          <option value="" disabled>
            Selecione uma seção
          </option>
          {secoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icone ? `${s.icone} ` : ""}{s.titulo}
              {s.acesso === "cadastro" ? " (🔒 cadastrados)" : ""}
            </option>
          ))}
        </select>
      </Campo>

      {/* Acesso do conteúdo (sobrescreve o da seção) */}
      <Campo label="Acesso deste conteúdo" erro={erros.acesso} htmlFor="acesso">
        <select
          id="acesso"
          name="acesso"
          defaultValue={d.acesso ?? "herdar"}
          className="input"
        >
          <option value="herdar">↕️ Herdar da seção (padrão)</option>
          <option value="aberto">🌐 Sempre aberto — mesmo em seção restrita</option>
          <option value="cadastro">🔒 Somente cadastrados — mesmo em seção aberta</option>
        </select>
        <p className="mt-1 text-xs text-muted">
          Conteúdo restrito aparece como card com cadeado convidando ao cadastro.
        </p>
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
          defaultValue={d.url}
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
            defaultValue={d.prova}
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
            defaultValue={d.duracaoMin}
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
            const marcado = d.estados?.includes(e.uf) ?? false;
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
          defaultValue={d.thumbnail}
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
          defaultValue={d.descricao}
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
