import Link from "next/link";
import { auth } from "@/auth";
import { listarConteudos } from "@/server/conteudos";
import AdminHeader from "./AdminHeader";
import DeleteButton from "./DeleteButton";

export const metadata = { title: "Admin · Conteúdos | Cobertura de Provas" };

// Sempre dinâmico (lê do banco a cada acesso).
export const dynamic = "force-dynamic";

function contarEstados(json: string): number {
  try {
    return (JSON.parse(json) as string[]).length;
  } catch {
    return 0;
  }
}

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const session = await auth();
  const conteudos = await listarConteudos();
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok : undefined;

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6">
        {/* Título + ação */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Conteúdos</h1>
            <p className="text-sm text-muted">
              {conteudos.length} conteúdo{conteudos.length === 1 ? "" : "s"} cadastrado
              {conteudos.length === 1 ? "" : "s"}.
            </p>
          </div>
          <Link
            href="/admin/novo"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo conteúdo
          </Link>
        </div>

        {ok && (
          <div className="mb-4 rounded-lg border border-teal/40 bg-teal/10 px-4 py-2.5 text-sm text-teal">
            Conteúdo {ok === "criado" ? "criado" : "atualizado"} com sucesso.
          </div>
        )}

        {conteudos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted">Nenhum conteúdo ainda.</p>
            <Link
              href="/admin/novo"
              className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
            >
              Criar o primeiro conteúdo
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {conteudos.map((c) => {
              const nEstados = contarEstados(c.estados);
              return (
                <li
                  key={c.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
                          {c.secao.titulo}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            c.tipo === "youtube"
                              ? "bg-error/15 text-error"
                              : "bg-teal/15 text-teal"
                          }`}
                        >
                          {c.tipo === "youtube" ? "Vídeo" : "Arquivo"}
                        </span>
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">
                          {nEstados === 0 ? "Nacional" : `${nEstados} estado(s)`}
                        </span>
                        {c.acesso === "aberto" && (
                          <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[11px] font-semibold text-teal">
                            🌐 Sempre aberto
                          </span>
                        )}
                        {c.acesso === "cadastro" && (
                          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                            🔒 Cadastrados
                          </span>
                        )}
                      </div>
                      <h3 className="truncate font-semibold">{c.titulo}</h3>
                      {c.prova && (
                        <p className="text-xs text-muted">{c.prova}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/${c.id}/editar`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/60 hover:text-foreground"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={c.id} titulo={c.titulo} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
