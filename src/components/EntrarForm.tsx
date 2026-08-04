"use client";

import { useActionState } from "react";
import { entrarAction, type EntrarState } from "@/app/cadastro/actions";

const inicial: EntrarState = { ok: false };

/** "Login" de quem já se cadastrou: entra apenas com o e-mail do cadastro. */
export default function EntrarForm({ voltar }: { voltar?: string }) {
  const [state, formAction, pending] = useActionState(entrarAction, inicial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Honeypot anti-bot (invisível; humanos não preenchem) */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {voltar && <input type="hidden" name="voltar" value={voltar} />}

      <div>
        <label
          htmlFor="email-entrar"
          className="mb-1.5 block text-sm font-semibold text-foreground"
        >
          E-mail do cadastro
        </label>
        <input
          id="email-entrar"
          name="email"
          type="email"
          defaultValue={state.email}
          placeholder="voce@email.com"
          className="input"
          autoComplete="email"
          maxLength={254}
          aria-invalid={!!state.erro}
          aria-describedby={state.erro ? "email-entrar-erro" : undefined}
        />
        {state.erro && (
          <p id="email-entrar-erro" className="mt-1 text-xs text-error">
            {state.erro}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-xs text-muted">
        Sem senha: usamos o e-mail que você informou no cadastro.
      </p>
    </form>
  );
}
