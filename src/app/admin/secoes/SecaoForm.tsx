"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Acesso, ContentType, Nivel } from "@/lib/types";
import type { SecaoFormState } from "./actions";

export interface SecaoDefaults {
  titulo?: string;
  icone?: string;
  nivel?: Nivel;
  tipoPadrao?: ContentType;
  acesso?: Acesso;
}

const inicial: SecaoFormState = { ok: false };

export default function SecaoForm({
  action,
  defaults = {},
  submitLabel,
  limparAoSalvar = false,
}: {
  action: (prev: SecaoFormState, formData: FormData) => Promise<SecaoFormState>;
  defaults?: SecaoDefaults;
  submitLabel: string;
  limparAoSalvar?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, inicial);
  const formRef = useRef<HTMLFormElement>(null);
  const erros = state.erros ?? {};

  useEffect(() => {
    if (state.ok && limparAoSalvar) formRef.current?.reset();
  }, [state.ok, limparAoSalvar]);

  // Eco pós-erro de validação (React 19 reseta o form após a action).
  const v = state.valores;
  const d: SecaoDefaults = v
    ? {
        titulo: v.titulo,
        icone: v.icone,
        nivel: (v.nivel === "R+" ? "R+" : "R1") as Nivel,
        tipoPadrao: (v.tipoPadrao === "arquivo" ? "arquivo" : "youtube") as ContentType,
        acesso: (v.acesso === "cadastro" ? "cadastro" : "aberto") as Acesso,
      }
    : defaults;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_110px]">
        <div>
          <label htmlFor="titulo" className="mb-1.5 block text-sm font-semibold">
            Título da seção
          </label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            defaultValue={d.titulo}
            placeholder="Ex.: Simulados Comentados R1"
            className="input"
          />
          {erros.titulo && <p className="mt-1 text-xs text-error">{erros.titulo}</p>}
        </div>
        <div>
          <label htmlFor="icone" className="mb-1.5 block text-sm font-semibold">
            Ícone (emoji)
          </label>
          <input
            id="icone"
            name="icone"
            type="text"
            defaultValue={d.icone}
            placeholder="⚡"
            className="input text-center"
          />
          {erros.icone && <p className="mt-1 text-xs text-error">{erros.icone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="nivel" className="mb-1.5 block text-sm font-semibold">
            Nível
          </label>
          <select id="nivel" name="nivel" defaultValue={d.nivel ?? "R1"} className="input">
            <option value="R1">Acesso Direto (R1)</option>
            <option value="R+">Especialidade (R+)</option>
          </select>
          {erros.nivel && <p className="mt-1 text-xs text-error">{erros.nivel}</p>}
        </div>
        <div>
          <label htmlFor="tipoPadrao" className="mb-1.5 block text-sm font-semibold">
            Tipo padrão
          </label>
          <select
            id="tipoPadrao"
            name="tipoPadrao"
            defaultValue={d.tipoPadrao ?? "youtube"}
            className="input"
          >
            <option value="youtube">🎥 Vídeos (YouTube)</option>
            <option value="arquivo">📄 Arquivos (download)</option>
          </select>
        </div>
        <div>
          <label htmlFor="acesso" className="mb-1.5 block text-sm font-semibold">
            Acesso
          </label>
          <select
            id="acesso"
            name="acesso"
            defaultValue={d.acesso ?? "aberto"}
            className="input"
          >
            <option value="aberto">🌐 Aberto ao público</option>
            <option value="cadastro">🔒 Somente cadastrados</option>
          </select>
          {erros.acesso && <p className="mt-1 text-xs text-error">{erros.acesso}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Seções “somente cadastrados” aparecem borradas com convite ao cadastro.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>

      {erros.form && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
          {erros.form}
        </p>
      )}

      {state.ok && state.mensagem && (
        <p className="rounded-lg border border-teal/40 bg-teal/10 px-3 py-2 text-sm text-teal">
          {state.mensagem}
        </p>
      )}
    </form>
  );
}
