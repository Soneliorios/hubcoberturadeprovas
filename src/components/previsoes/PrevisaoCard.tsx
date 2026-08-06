"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PrevisaoPublica, ProvaStatus } from "@/lib/previsoes-types";
import { votarAction } from "@/app/previsoes/actions";

export default function PrevisaoCard({
  previsao,
  provaId,
  status,
  podeVotar,
}: {
  previsao: PrevisaoPublica;
  provaId: string;
  status: ProvaStatus;
  podeVotar: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sim, setSim] = useState(previsao.votosSim);
  const [total, setTotal] = useState(previsao.votosTotal);
  const [meuVoto, setMeuVoto] = useState<boolean | null>(previsao.meuVoto);
  const [erro, setErro] = useState<string | null>(null);

  const pctSim = total > 0 ? Math.round((sim / total) * 100) : 0;
  const votando = status === "votacao";
  const temResultado = status === "resultado" && previsao.caiu !== null;

  function votar(escolha: boolean) {
    if (!votando || pending) return;
    if (!podeVotar) {
      router.push(`/cadastro?voltar=/previsoes/${provaId}`);
      return;
    }
    setErro(null);
    // Toggle: clicar no voto atual remove.
    const novo: boolean | null = meuVoto === escolha ? null : escolha;

    // Atualização otimista dos contadores.
    const anterior = { sim, total, meuVoto };
    let nSim = sim;
    let nTotal = total;
    if (anterior.meuVoto === true) nSim -= 1;
    if (anterior.meuVoto !== null) nTotal -= 1;
    if (novo === true) nSim += 1;
    if (novo !== null) nTotal += 1;
    setSim(nSim);
    setTotal(nTotal);
    setMeuVoto(novo);

    startTransition(async () => {
      const r = await votarAction(previsao.id, novo, provaId);
      if (!r.ok) {
        // desfaz otimista
        setSim(anterior.sim);
        setTotal(anterior.total);
        setMeuVoto(anterior.meuVoto);
        if (r.precisaCadastro) {
          router.push(`/cadastro?voltar=/previsoes/${provaId}`);
        } else {
          setErro(r.motivo ?? "Não foi possível registrar seu voto.");
        }
        return;
      }
      if (r.votosSim != null) setSim(r.votosSim);
      if (r.votosTotal != null) setTotal(r.votosTotal);
    });
  }

  return (
    <div
      className={`rounded-2xl border bg-surface p-4 transition-colors sm:p-5 ${
        temResultado
          ? previsao.caiu
            ? "border-teal/50"
            : "border-error/40"
          : "border-border"
      }`}
    >
      {/* Cabeçalho: especialidade + resultado */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {previsao.especialidade && (
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              {previsao.especialidade}
            </span>
          )}
          {temResultado && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                previsao.caiu
                  ? "bg-teal/20 text-teal"
                  : "bg-error/15 text-error"
              }`}
            >
              {previsao.caiu ? "✅ Caiu na prova" : "❌ Não caiu"}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base font-bold leading-snug">{previsao.titulo}</h3>
      {previsao.descricao && (
        <p className="mt-1 text-sm text-muted">{previsao.descricao}</p>
      )}

      {/* Barra da "galera" — mostra % só quando há votos (0 votos ≠ 0% de consenso) */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-teal">
            {total > 0 ? `🔥 ${pctSim}% acham que vai cair` : "🔮 Ainda sem votos"}
          </span>
          <span className="text-muted">
            {total > 0
              ? `${total} voto${total === 1 ? "" : "s"}`
              : votando
                ? "seja o primeiro!"
                : ""}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          {total > 0 && (
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-teal-strong transition-[width] duration-500 ease-out"
              style={{ width: `${pctSim}%` }}
            />
          )}
        </div>
      </div>

      {/* Votação */}
      {votando && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => votar(true)}
              disabled={pending}
              aria-pressed={meuVoto === true}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all disabled:opacity-60 ${
                meuVoto === true
                  ? "border-teal bg-teal text-black"
                  : "border-border bg-surface-2 text-foreground hover:border-teal/60"
              }`}
            >
              🔥 Vai cair
            </button>
            <button
              type="button"
              onClick={() => votar(false)}
              disabled={pending}
              aria-pressed={meuVoto === false}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all disabled:opacity-60 ${
                meuVoto === false
                  ? "border-blue bg-blue text-white"
                  : "border-border bg-surface-2 text-foreground hover:border-blue/60"
              }`}
            >
              🧊 Não vai cair
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">
            {!podeVotar
              ? "Cadastre-se grátis para votar e concorrer à pontuação."
              : meuVoto !== null
                ? "Seu voto foi registrado · toque de novo para desfazer."
                : "Toque para votar."}
          </p>
          {erro && (
            <p className="mt-1 text-center text-xs text-error">{erro}</p>
          )}
        </div>
      )}

      {/* Encerrada (aguardando resultado) */}
      {status === "encerrada" && (
        <p className="mt-3 text-center text-xs text-muted">
          {meuVoto === null
            ? "Votação encerrada — aguardando o resultado da prova."
            : `Você votou: ${meuVoto ? "vai cair 🔥" : "não vai cair 🧊"} · aguardando resultado.`}
        </p>
      )}

      {/* Resultado */}
      {temResultado && (
        <div className="mt-3">
          {meuVoto === null ? (
            <p className="text-center text-xs text-muted">Você não votou nesta.</p>
          ) : previsao.acertei ? (
            <p className="rounded-lg bg-teal/15 px-3 py-2 text-center text-sm font-bold text-teal">
              🎯 Você acertou!
            </p>
          ) : (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-center text-sm font-bold text-error">
              Você errou essa
            </p>
          )}
        </div>
      )}

      {/* Prova em resultado, mas esta previsão ainda sem gabarito marcado */}
      {status === "resultado" && previsao.caiu === null && (
        <p className="mt-3 text-center text-xs text-muted">
          {meuVoto === null
            ? "Aguardando o gabarito desta previsão."
            : `Você votou: ${meuVoto ? "vai cair 🔥" : "não vai cair 🧊"} · aguardando gabarito.`}
        </p>
      )}
    </div>
  );
}
