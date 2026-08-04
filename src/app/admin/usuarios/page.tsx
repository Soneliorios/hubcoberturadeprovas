import { auth } from "@/auth";
import AdminHeader from "../AdminHeader";
import NovoAdminForm from "./NovoAdminForm";
import UsuarioAcoes from "./UsuarioAcoes";
import { listarUsuarios } from "@/server/usuarios";

export const metadata = { title: "Admin · Administradores" };
export const dynamic = "force-dynamic";

function formatarData(d: Date): string {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function UsuariosPage() {
  const session = await auth();
  const usuarios = await listarUsuarios();
  const meuId = session?.user?.id;

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Administradores</h1>
          <p className="text-sm text-muted">
            Só administradores existentes podem adicionar novos. Não há cadastro
            público.
          </p>
        </div>

        <div className="mb-6">
          <NovoAdminForm />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {usuarios.length} administrador{usuarios.length === 1 ? "" : "es"}
        </h2>
        <ul className="space-y-3">
          {usuarios.map((u) => (
            <li
              key={u.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{u.nome}</h3>
                  <p className="truncate text-sm text-muted">{u.email}</p>
                  <p className="mt-0.5 text-xs text-muted/70">
                    Desde {formatarData(u.criadoEm)}
                  </p>
                </div>
                <UsuarioAcoes
                  id={u.id}
                  nome={u.nome}
                  ehVoce={u.id === meuId}
                  podeExcluir={usuarios.length > 1 && u.id !== meuId}
                />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
