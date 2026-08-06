import Link from "next/link";
import { auth } from "@/auth";
import AdminHeader from "../AdminHeader";
import { listarProvasAdmin } from "@/server/previsoes";
import { criarProvaAction } from "./actions";
import { ESTADOS } from "@/data/estados";
import { rotuloStatus } from "@/lib/previsoes-types";

export const metadata = { title: "Admin · Previsões" };
export const dynamic = "force-dynamic";

export default async function AdminPrevisoesPage() {
  const [session, provas] = await Promise.all([auth(), listarProvasAdmin()]);

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Previsões</h1>
            <p className="text-sm text-muted">
              Crie uma prova, adicione os temas que acham que vão cair e, depois do
              gabarito, marque o resultado — os usuários recebem a pontuação.
            </p>
          </div>
          <Link
            href="/admin/previsoes/importar"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-teal/60 bg-teal/10 px-4 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20"
          >
            <span aria-hidden>🔮</span> Importar do MedBrain (PDF)
          </Link>
        </div>

        {/* Nova prova */}
        <form
          action={criarProvaAction}
          className="mb-6 rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2 className="mb-4 text-base font-bold">Nova prova</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px_150px]">
            <div>
              <label htmlFor="nome" className="mb-1.5 block text-sm font-semibold">
                Nome da prova
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                placeholder="Ex.: USP-SP 2026"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="nivel" className="mb-1.5 block text-sm font-semibold">
                Nível
              </label>
              <select id="nivel" name="nivel" defaultValue="" className="input">
                <option value="">—</option>
                <option value="R1">Acesso Direto (R1)</option>
                <option value="R+">Especialidade (R+)</option>
              </select>
            </div>
            <div>
              <label htmlFor="estado" className="mb-1.5 block text-sm font-semibold">
                Estado
              </label>
              <select id="estado" name="estado" defaultValue="" className="input">
                <option value="">—</option>
                {ESTADOS.map((e) => (
                  <option key={e.uf} value={e.uf}>
                    {e.uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label htmlFor="dataProva" className="mb-1.5 block text-sm font-semibold">
                Data da prova (opcional)
              </label>
              <input
                id="dataProva"
                name="dataProva"
                type="datetime-local"
                className="input sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
            >
              Criar prova
            </button>
          </div>
        </form>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {provas.length} prova{provas.length === 1 ? "" : "s"}
        </h2>
        <ul className="space-y-3">
          {provas.map((p) => {
            const st = rotuloStatus(p.status);
            return (
              <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.classe}`}>
                        {st.label}
                      </span>
                      {p.nivel && (
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
                          {p.nivel}
                        </span>
                      )}
                      {p.estado && (
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                          {p.estado}
                        </span>
                      )}
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                        {p._count.previsoes} previsã{p._count.previsoes === 1 ? "o" : "es"}
                      </span>
                    </div>
                    <h3 className="truncate font-semibold">{p.nome}</h3>
                  </div>
                  <Link
                    href={`/admin/previsoes/${p.id}`}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/60 hover:text-foreground"
                  >
                    Gerenciar →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
