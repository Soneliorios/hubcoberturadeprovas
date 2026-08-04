"use client";

import { useState } from "react";
import CadastroForm from "./CadastroForm";
import EntrarForm from "./EntrarForm";

export type ModoAcesso = "cadastro" | "entrar";

/**
 * Card da página /cadastro com o switch entre criar cadastro e entrar
 * (para quem já se cadastrou em outro navegador ou perdeu o acesso).
 */
export default function AcessoCard({
  modoInicial = "cadastro",
  voltar,
}: {
  modoInicial?: ModoAcesso;
  voltar?: string;
}) {
  const [modo, setModo] = useState<ModoAcesso>(modoInicial);

  return (
    <div>
      {/* Switch cadastro/entrar */}
      <div
        role="tablist"
        aria-label="Cadastro ou acesso"
        className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-2/60 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={modo === "cadastro"}
          onClick={() => setModo("cadastro")}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
            modo === "cadastro"
              ? "bg-teal text-black"
              : "text-muted hover:text-foreground"
          }`}
        >
          Criar cadastro
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modo === "entrar"}
          onClick={() => setModo("entrar")}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
            modo === "entrar"
              ? "bg-teal text-black"
              : "text-muted hover:text-foreground"
          }`}
        >
          Já tenho cadastro
        </button>
      </div>

      {modo === "cadastro" ? (
        <CadastroForm voltar={voltar} />
      ) : (
        <EntrarForm voltar={voltar} />
      )}

      <p className="mt-4 text-center text-xs text-muted">
        {modo === "cadastro" ? (
          <>
            Já se cadastrou antes?{" "}
            <button
              type="button"
              onClick={() => setModo("entrar")}
              className="font-semibold text-teal hover:underline"
            >
              Entrar com seu e-mail
            </button>
          </>
        ) : (
          <>
            Primeira vez por aqui?{" "}
            <button
              type="button"
              onClick={() => setModo("cadastro")}
              className="font-semibold text-teal hover:underline"
            >
              Criar cadastro grátis
            </button>
          </>
        )}
      </p>
    </div>
  );
}
