import { auth } from "@/auth";
import { listarSecoes } from "@/server/secoes";
import AdminHeader from "../AdminHeader";
import SecaoForm from "./SecaoForm";
import SecaoAcoes from "./SecaoAcoes";
import { criarSecaoAction } from "./actions";

export const metadata = { title: "Admin · Seções | Cobertura de Provas" };
export const dynamic = "force-dynamic";

export default async function SecoesPage({
  searchParams,
}: PageProps<"/admin/secoes">) {
  const [session, secoes, sp] = await Promise.all([
    auth(),
    listarSecoes(),
    searchParams,
  ]);

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Seções</h1>
          <p className="text-sm text-muted">
            Organize as categorias da home: crie, edite, reordene e defina se
            cada uma é aberta ao público ou exclusiva para cadastrados.
          </p>
        </div>

        {sp.ok === "atualizada" && (
          <div className="mb-4 rounded-lg border border-teal/40 bg-teal/10 px-4 py-2.5 text-sm text-teal">
            Seção atualizada com sucesso.
          </div>
        )}

        {/* Criar nova seção */}
        <div className="mb-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="mb-4 text-base font-bold">Nova seção</h2>
          <SecaoForm
            action={criarSecaoAction}
            submitLabel="Criar seção"
            limparAoSalvar
          />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {secoes.length} seç{secoes.length === 1 ? "ão" : "ões"} (ordem de exibição)
        </h2>

        <ul className="space-y-3">
          {secoes.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        s.acesso === "cadastro"
                          ? "bg-warning/15 text-warning"
                          : "bg-teal/15 text-teal"
                      }`}
                    >
                      {s.acesso === "cadastro" ? "🔒 Cadastrados" : "🌐 Aberto"}
                    </span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
                      {s.nivel === "R+" ? "Especialidade (R+)" : "Acesso Direto (R1)"}
                    </span>
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                      {s._count.conteudos} conteúdo{s._count.conteudos === 1 ? "" : "s"}
                    </span>
                  </div>
                  <h3 className="truncate font-semibold">
                    {s.icone && <span aria-hidden>{s.icone} </span>}
                    {s.titulo}
                  </h3>
                </div>

                <SecaoAcoes
                  id={s.id}
                  titulo={s.titulo}
                  acesso={s.acesso}
                  totalConteudos={s._count.conteudos}
                  primeira={i === 0}
                  ultima={i === secoes.length - 1}
                />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
