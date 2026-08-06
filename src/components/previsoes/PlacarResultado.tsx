import Link from "next/link";
import type { Placar } from "@/lib/previsoes-types";
import { plural } from "@/lib/previsoes-types";

/** Hero de resultado: mostra quantas previsões o usuário acertou. */
export default function PlacarResultado({
  placar,
  podeVotar,
  provaId,
}: {
  placar: Placar;
  podeVotar: boolean;
  provaId: string;
}) {
  const { acertos, resolvidas, votadas, votouNaProva } = placar;

  // Visitante sem cadastro: convite (não tem votos para pontuar).
  if (!podeVotar) {
    return (
      <div className="rounded-2xl border border-teal/40 bg-teal/10 p-5 text-center">
        <p className="text-lg font-bold">O resultado desta prova saiu! 🎉</p>
        <p className="mt-1 text-sm text-muted">
          Cadastre-se para votar nas próximas e descobrir quantas você acerta.
        </p>
        <Link
          href={`/cadastro?voltar=/previsoes/${provaId}`}
          className="mt-4 inline-block rounded-lg bg-teal px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
        >
          Fazer cadastro grátis
        </Link>
      </div>
    );
  }

  // Publicado, mas nenhum gabarito marcado ainda → apuração em andamento.
  if (resolvidas === 0) {
    return (
      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 text-center">
        <p className="text-lg font-bold">Apuração em andamento ⏳</p>
        <p className="mt-1 text-sm text-muted">
          {votouNaProva > 0
            ? "Seus palpites estão salvos. Assim que o gabarito sair, sua pontuação aparece aqui."
            : "O gabarito está sendo lançado — volte em breve para conferir os acertos."}
        </p>
      </div>
    );
  }

  // Resolvido, mas o usuário não votou em nenhuma resolvida.
  if (votadas === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center">
        <p className="text-lg font-bold">
          {votouNaProva > 0
            ? "Nenhum dos seus palpites teve gabarito ainda"
            : "Você não votou nesta prova"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {plural(resolvidas, "previsão já teve", "previsões já tiveram")} resultado.
          Participe da próxima! 🎯
        </p>
      </div>
    );
  }

  const pct = Math.round((acertos / votadas) * 100);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-navy/40 to-surface p-6 text-center sm:flex-row sm:text-left">
      {/* Anel de acerto */}
      <div
        className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--teal) ${pct * 3.6}deg, var(--surface-2) 0deg)`,
        }}
      >
        <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-background">
          <span className="text-2xl font-extrabold text-teal">{pct}%</span>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-lg font-bold sm:text-xl">
          Você acertou{" "}
          <span className="text-teal">
            {acertos} de {votadas}
          </span>{" "}
          {votadas === 1 ? "previsão que votou" : "previsões que votou"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {pct >= 70
            ? "Mandou muito bem! 🔥"
            : pct >= 40
              ? "Boa! Dá pra melhorar na próxima. 💪"
              : "Nem tudo é previsível — bora pra próxima! 🎯"}
          {resolvidas > votadas &&
            ` · ${plural(resolvidas - votadas, "previsão que você não votou também teve", "previsões que você não votou também tiveram")} resultado.`}
        </p>
      </div>
    </div>
  );
}
