import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PrevisaoCard from "@/components/previsoes/PrevisaoCard";
import PlacarResultado from "@/components/previsoes/PlacarResultado";
import ContagemRegressiva from "@/components/previsoes/ContagemRegressiva";
import { getProvaDetalhe } from "@/server/previsoes";
import { getLeadIdAtual } from "@/server/leads";
import { rotuloStatus, plural } from "@/lib/previsoes-types";

export const dynamic = "force-dynamic";

export default async function ProvaPrevisoesPage({
  params,
}: PageProps<"/previsoes/[prova]">) {
  const { prova: provaId } = await params;
  const leadId = await getLeadIdAtual();
  const prova = await getProvaDetalhe(provaId, leadId);
  if (!prova) notFound();

  const status = rotuloStatus(prova.status);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-6">
          <Link
            href="/previsoes"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Previsões
          </Link>

          {/* Cabeçalho da prova */}
          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.classe}`}>
                {status.label}
              </span>
              {prova.nivel && (
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                  {prova.nivel === "R+" ? "Especialidade" : "Acesso Direto"}
                </span>
              )}
              {prova.estado && (
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                  {prova.estado}
                </span>
              )}
              {prova.status === "votacao" && prova.dataProva && (
                <ContagemRegressiva dataISO={prova.dataProva} />
              )}
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">{prova.nome}</h1>
            <p className="mt-1 text-sm text-muted">
              {plural(prova.totalPrevisoes, "previsão", "previsões")} ·{" "}
              {plural(prova.participantes, "pessoa", "pessoas")}{" "}
              {prova.status === "votacao" ? "votando" : "participaram"}
            </p>
          </div>

          {/* Placar (resultado) */}
          {prova.status === "resultado" && (
            <div className="mb-5">
              <PlacarResultado
                placar={prova.placar}
                podeVotar={prova.podeVotar}
                provaId={prova.id}
              />
            </div>
          )}

          {/* Convite a votar (visitante sem cadastro, votação aberta) */}
          {prova.status === "votacao" && !prova.podeVotar && (
            <div className="mb-5 flex flex-col items-center gap-2 rounded-2xl border border-teal/40 bg-teal/10 px-5 py-4 text-center sm:flex-row sm:text-left">
              <p className="flex-1 text-sm">
                <span className="font-bold">Vote e concorra à pontuação!</span> Cadastre-se
                grátis para palpitar nos temas e, quando o gabarito sair, ver seus acertos.
              </p>
              <Link
                href={`/cadastro?voltar=/previsoes/${prova.id}`}
                className="shrink-0 rounded-lg bg-teal px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
              >
                Fazer cadastro grátis
              </Link>
            </div>
          )}

          {/* Lista de previsões */}
          {prova.previsoes.length === 0 ? (
            <p className="py-16 text-center text-muted">
              Nenhuma previsão cadastrada nesta prova ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {prova.previsoes.map((p) => (
                <PrevisaoCard
                  key={p.id}
                  previsao={p}
                  provaId={prova.id}
                  status={prova.status}
                  podeVotar={prova.podeVotar}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
