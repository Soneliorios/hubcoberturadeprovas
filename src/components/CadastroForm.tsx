"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS } from "@/data/estados";
import type { UF } from "@/lib/types";

interface Erros {
  nome?: string;
  email?: string;
  telefone?: string;
  provas?: string;
}

function formatarTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function CadastroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [provas, setProvas] = useState<UF[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  function toggleProva(uf: UF) {
    setProvas((prev) =>
      prev.includes(uf) ? prev.filter((p) => p !== uf) : [...prev, uf]
    );
  }

  function validar(): boolean {
    const e: Erros = {};
    if (nome.trim().length < 3) e.nome = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Informe um e-mail válido.";
    if (telefone.replace(/\D/g, "").length < 10)
      e.telefone = "Informe um telefone com DDD.";
    if (provas.length === 0)
      e.provas = "Selecione ao menos um estado/prova.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validar()) return;
    setEnviando(true);

    // TODO: integrar com o CRM aqui (RD Station / HubSpot / etc.)
    // Por enquanto apenas simula o envio e segue para os conteúdos.
    const lead = { nome, email, telefone, provas };
    console.log("Lead capturado (mock):", lead);
    await new Promise((r) => setTimeout(r, 600));

    router.push("/conteudos");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Campo label="Nome completo" erro={erros.nome} htmlFor="nome">
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          className="input"
          autoComplete="name"
        />
      </Campo>

      <Campo label="E-mail" erro={erros.email} htmlFor="email">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="input"
          autoComplete="email"
        />
      </Campo>

      <Campo label="Telefone / WhatsApp" erro={erros.telefone} htmlFor="telefone">
        <input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
          placeholder="(11) 99999-9999"
          className="input"
          autoComplete="tel"
        />
      </Campo>

      <Campo
        label="Quais provas você vai prestar?"
        erro={erros.provas}
        htmlFor=""
      >
        <div className="no-scrollbar mt-1 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {ESTADOS.map((e) => {
            const ativo = provas.includes(e.uf);
            return (
              <button
                key={e.uf}
                type="button"
                onClick={() => toggleProva(e.uf)}
                title={e.nome}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  ativo
                    ? "border-teal bg-teal text-black"
                    : "border-border bg-surface text-muted hover:border-teal/50 hover:text-foreground"
                }`}
              >
                {e.uf}
              </button>
            );
          })}
        </div>
      </Campo>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Acessar conteúdos"}
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
