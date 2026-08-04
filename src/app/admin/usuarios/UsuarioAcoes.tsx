"use client";

import { useActionState, useEffect, useState } from "react";
import {
  redefinirSenhaAction,
  excluirUsuarioAction,
  type UsuarioFormState,
} from "./actions";

const inicial: UsuarioFormState = { ok: false };

export default function UsuarioAcoes({
  id,
  nome,
  ehVoce,
  podeExcluir,
}: {
  id: string;
  nome: string;
  ehVoce: boolean;
  podeExcluir: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction, pending] = useActionState(
    redefinirSenhaAction,
    inicial
  );

  useEffect(() => {
    if (state.ok) setAberto(false);
  }, [state.ok]);

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/60 hover:text-foreground"
        >
          Redefinir senha
        </button>

        {ehVoce ? (
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted">
            você
          </span>
        ) : (
          <form
            action={excluirUsuarioAction}
            onSubmit={(e) => {
              if (!podeExcluir) {
                e.preventDefault();
                return;
              }
              if (!confirm(`Remover o admin "${nome}"? Ele perderá o acesso.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              disabled={!podeExcluir}
              title={podeExcluir ? undefined : "Não é possível remover o último admin."}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-error/60 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
            >
              Excluir
            </button>
          </form>
        )}
      </div>

      {aberto && (
        <form
          action={formAction}
          className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="id" value={id} />
          <input
            name="senha"
            type="text"
            placeholder="Nova senha (mín. 8)"
            className="input py-1.5 text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-lg bg-teal px-3 py-1.5 text-sm font-bold text-black hover:bg-teal-strong disabled:opacity-60"
          >
            {pending ? "..." : "Salvar"}
          </button>
        </form>
      )}

      {state.erros?.senha && (
        <p className="text-xs text-error">{state.erros.senha}</p>
      )}
      {state.ok && state.mensagem && (
        <p className="text-xs text-teal">{state.mensagem}</p>
      )}
    </div>
  );
}
