"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarUsuarioAction, type UsuarioFormState } from "./actions";

const inicial: UsuarioFormState = { ok: false };

export default function NovoAdminForm() {
  const [state, formAction, pending] = useActionState(
    criarUsuarioAction,
    inicial
  );
  const formRef = useRef<HTMLFormElement>(null);
  const erros = state.erros ?? {};

  // Limpa o formulário após criar com sucesso.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 className="mb-4 text-base font-bold">Adicionar novo admin</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold">
            Nome
          </label>
          <input id="nome" name="nome" type="text" placeholder="Nome completo" className="input" />
          {erros.nome && <p className="mt-1 text-xs text-error">{erros.nome}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            E-mail
          </label>
          <input id="email" name="email" type="email" placeholder="email@medway.com.br" className="input" autoComplete="off" />
          {erros.email && <p className="mt-1 text-xs text-error">{erros.email}</p>}
        </div>
        <div>
          <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold">
            Senha inicial
          </label>
          <input id="senha" name="senha" type="text" placeholder="Mín. 8 caracteres" className="input" autoComplete="off" />
          {erros.senha && <p className="mt-1 text-xs text-error">{erros.senha}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          O novo admin entra com este e-mail e senha. Combine a senha com a pessoa — ela poderá ser redefinida depois.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
        >
          {pending ? "Criando..." : "Adicionar admin"}
        </button>
      </div>

      {state.ok && state.mensagem && (
        <p className="mt-3 rounded-lg border border-teal/40 bg-teal/10 px-3 py-2 text-sm text-teal">
          {state.mensagem}
        </p>
      )}
    </form>
  );
}
