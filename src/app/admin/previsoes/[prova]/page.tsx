import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import AdminHeader from "../../AdminHeader";
import BotaoConfirmar from "@/components/BotaoConfirmar";
import { getProvaComPrevisoesAdmin } from "@/server/previsoes";
import { rotuloStatus } from "@/lib/previsoes-types";
import {
  criarPrevisaoAction,
  definirResultadoAction,
  definirStatusProvaAction,
  excluirPrevisaoAction,
  excluirProvaAction,
} from "../actions";

export const metadata = { title: "Admin · Gerenciar prova" };
export const dynamic = "force-dynamic";

const STATUS_OPCOES: { valor: string; label: string; hint: string }[] = [
  { valor: "votacao", label: "Votação aberta", hint: "usuários podem votar" },
  { valor: "encerrada", label: "Votação encerrada", hint: "fecha os votos, aguarda gabarito" },
  { valor: "resultado", label: "Resultado publicado", hint: "libera a pontuação" },
];

export default async function GerenciarProvaPage({
  params,
}: PageProps<"/admin/previsoes/[prova]">) {
  const { prova: provaId } = await params;
  const [session, dados] = await Promise.all([
    auth(),
    getProvaComPrevisoesAdmin(provaId),
  ]);
  if (!dados) notFound();
  const { prova, previsoes } = dados;
  const st = rotuloStatus(prova.status);
  const naoMarcadas = previsoes.filter((p) => p.caiu === null).length;

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/admin/previsoes"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Previsões
        </Link>

        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{prova.nome}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${st.classe}`}>
            {st.label}
          </span>
        </div>
        <p className="mb-5 text-sm text-muted">
          {prova.nivel ?? "sem nível"} · {prova.estado ?? "nacional"} · {previsoes.length}{" "}
          previsã{previsoes.length === 1 ? "o" : "es"}
        </p>

        {/* Status da prova */}
        <div className="mb-6 rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-semibold">Fase da prova</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPCOES.map((o) => {
              const atual = prova.status === o.valor;
              const classe = `rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-default ${
                atual
                  ? "border-teal bg-teal text-black"
                  : "border-border text-muted hover:border-teal/60 hover:text-foreground"
              }`;
              // Publicar resultado com previsões sem gabarito → confirmar.
              const precisaConfirmar = o.valor === "resultado" && !atual && naoMarcadas > 0;
              return (
                <form key={o.valor} action={definirStatusProvaAction}>
                  <input type="hidden" name="id" value={prova.id} />
                  <input type="hidden" name="status" value={o.valor} />
                  {precisaConfirmar ? (
                    <BotaoConfirmar
                      confirmar={`${naoMarcadas} previsão(ões) ainda sem resultado marcado. Elas não contarão na pontuação enquanto ficarem indefinidas. Publicar o resultado mesmo assim?`}
                      className={classe}
                    >
                      {o.label}
                    </BotaoConfirmar>
                  ) : (
                    <button type="submit" disabled={atual} title={o.hint} className={classe}>
                      {o.label}
                    </button>
                  )}
                </form>
              );
            })}
          </div>
          {prova.status !== "resultado" && naoMarcadas > 0 && previsoes.length > 0 && (
            <p className="mt-2 text-xs text-warning">
              ⚠️ {naoMarcadas} previsão(ões) sem resultado marcado.
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            {prova.status === "votacao" && "Usuários votam livremente. Feche a votação antes da prova."}
            {prova.status === "encerrada" && "Votos travados. Marque o resultado de cada previsão e publique."}
            {prova.status === "resultado" && "Pontuação liberada para os usuários."}
          </p>
        </div>

        {/* Nova previsão */}
        <form
          action={criarPrevisaoAction}
          className="mb-6 rounded-xl border border-border bg-surface p-4"
        >
          <input type="hidden" name="provaId" value={prova.id} />
          <h2 className="mb-3 text-base font-bold">Nova previsão (tema)</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
            <input
              name="titulo"
              type="text"
              required
              placeholder="Ex.: Insuficiência cardíaca com FE reduzida"
              className="input"
            />
            <input
              name="especialidade"
              type="text"
              placeholder="Especialidade (opcional)"
              className="input"
            />
          </div>
          <textarea
            name="descricao"
            rows={2}
            placeholder="Descrição/observação (opcional)"
            className="input mt-3 resize-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-teal px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
            >
              Adicionar previsão
            </button>
          </div>
        </form>

        {/* Lista de previsões */}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {previsoes.length} previsã{previsoes.length === 1 ? "o" : "es"}
        </h2>
        <ul className="space-y-3">
          {previsoes.map((p) => {
            const pct = p.votosTotal > 0 ? Math.round((p.votosSim / p.votosTotal) * 100) : 0;
            return (
              <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {p.especialidade && (
                        <span className="mb-1 inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
                          {p.especialidade}
                        </span>
                      )}
                      <h3 className="font-semibold">{p.titulo}</h3>
                      {p.descricao && (
                        <p className="mt-0.5 text-sm text-muted">{p.descricao}</p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {p.votosTotal > 0
                          ? `🔥 ${pct}% acham que vai cair · ${p.votosTotal} voto${p.votosTotal === 1 ? "" : "s"}`
                          : "🔮 Ainda sem votos"}
                      </p>
                    </div>
                    <form action={excluirPrevisaoAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="provaId" value={prova.id} />
                      <BotaoConfirmar
                        confirmar={`Excluir a previsão "${p.titulo}" e seus votos?`}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-error/60 hover:text-error"
                      >
                        Excluir
                      </BotaoConfirmar>
                    </form>
                  </div>

                  {/* Resultado */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-muted">Resultado:</span>
                    {[
                      { v: "sim", label: "✅ Caiu", on: p.caiu === true, cls: "border-teal bg-teal/15 text-teal" },
                      { v: "nao", label: "❌ Não caiu", on: p.caiu === false, cls: "border-error/60 bg-error/10 text-error" },
                      { v: "", label: "Indefinido", on: p.caiu === null, cls: "border-border bg-surface-2 text-muted" },
                    ].map((opt) => (
                      <form key={opt.v} action={definirResultadoAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="provaId" value={prova.id} />
                        <input type="hidden" name="caiu" value={opt.v} />
                        <button
                          type="submit"
                          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                            opt.on ? opt.cls : "border-border text-muted hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Excluir prova */}
        <div className="mt-8 border-t border-border pt-5">
          <form action={excluirProvaAction}>
            <input type="hidden" name="id" value={prova.id} />
            <BotaoConfirmar
              confirmar={`Excluir a prova "${prova.nome}" com todas as previsões e votos? Esta ação não pode ser desfeita.`}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-error/60 hover:text-error"
            >
              Excluir prova
            </BotaoConfirmar>
          </form>
        </div>
      </main>
    </>
  );
}
