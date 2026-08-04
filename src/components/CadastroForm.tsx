"use client";

import { useActionState, useState } from "react";
import { ESTADOS } from "@/data/estados";
import { cadastrarAction, type CadastroState } from "@/app/cadastro/actions";

const estadoInicial: CadastroState = { ok: false };

function formatarTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Formulário público de captação de lead.
 * `voltar` = caminho interno para onde redirecionar após o cadastro
 * (ex.: a seção bloqueada de onde o visitante veio).
 *
 * Nota React 19: o form é resetado após a action; por isso a action ecoa
 * `state.valores` nos erros de validação e os usamos como defaultValue.
 */
export default function CadastroForm({ voltar }: { voltar?: string }) {
  const [state, formAction, pending] = useActionState(
    cadastrarAction,
    estadoInicial
  );
  const [telefone, setTelefone] = useState("");
  const erros = state.erros ?? {};
  const valores = state.valores;

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

      <Campo label="Nome completo" erro={erros.nome} htmlFor="nome">
        <input
          id="nome"
          name="nome"
          type="text"
          defaultValue={valores?.nome}
          placeholder="Seu nome"
          className="input"
          autoComplete="name"
          maxLength={120}
          aria-invalid={!!erros.nome}
          aria-describedby={erros.nome ? "nome-erro" : undefined}
        />
      </Campo>

      <Campo label="E-mail" erro={erros.email} htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={valores?.email}
          placeholder="voce@email.com"
          className="input"
          autoComplete="email"
          maxLength={254}
          aria-invalid={!!erros.email}
          aria-describedby={erros.email ? "email-erro" : undefined}
        />
      </Campo>

      <Campo label="Telefone / WhatsApp" erro={erros.telefone} htmlFor="telefone">
        <input
          id="telefone"
          name="telefone"
          type="tel"
          value={telefone || valores?.telefone || ""}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          placeholder="(11) 99999-9999"
          className="input"
          autoComplete="tel"
          maxLength={20}
          aria-invalid={!!erros.telefone}
          aria-describedby={erros.telefone ? "telefone-erro" : undefined}
        />
      </Campo>

      {/* Grupo de UFs com fieldset/legend (leitores de tela ganham contexto) */}
      <fieldset
        aria-describedby={erros.provas ? "provas-erro" : undefined}
      >
        <legend className="mb-1.5 block text-sm font-semibold text-foreground">
          Quais provas você vai prestar?
        </legend>
        <div className="no-scrollbar mt-1 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {ESTADOS.map((e) => (
            <label key={e.uf} className="cursor-pointer">
              <input
                type="checkbox"
                name="provas"
                value={e.uf}
                defaultChecked={valores?.provas.includes(e.uf)}
                className="peer sr-only"
                aria-label={e.nome}
              />
              <span className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/50 hover:text-foreground peer-checked:border-teal peer-checked:bg-teal peer-checked:text-black">
                {e.uf}
              </span>
            </label>
          ))}
        </div>
        {erros.provas && (
          <p id="provas-erro" className="mt-1 text-xs text-error">
            {erros.provas}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Desbloquear conteúdos"}
      </button>

      <p className="text-center text-xs text-muted">
        Ao continuar, você concorda em receber comunicações da Medway sobre a
        Cobertura de Provas.
      </p>
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
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      {children}
      {erro && (
        <p id={`${htmlFor}-erro`} className="mt-1 text-xs text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
