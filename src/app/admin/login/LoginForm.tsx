"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const estadoInicial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@medway.com.br"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="input"
        />
      </div>

      {state.erro && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {state.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
