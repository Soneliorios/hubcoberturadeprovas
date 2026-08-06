import Link from "next/link";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { auth } from "@/auth";
import { estaCadastrado } from "@/server/leads";
import { getNotificacoes } from "@/server/conteudos";

/** Header fixo no topo (escopo): logo + sino de notificações, fundo sólido dark.
 *  Visitante sem cadastro vê o CTA "Cadastre-se"; admin logado vê o atalho
 *  de volta ao painel. Notificações derivam dos conteúdos recentes do banco. */
export default async function Header() {
  const [session, cadastrado] = await Promise.all([auth(), estaCadastrado()]);
  const ehAdmin = !!session?.user;
  const notificacoes = await getNotificacoes(cadastrado || ehAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-5">
          <Logo />
          <nav className="flex items-center gap-1">
            <Link
              href="/conteudos"
              className="rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:px-2.5"
            >
              Conteúdos
            </Link>
            <Link
              href="/previsoes"
              className="rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:px-2.5"
            >
              🔮 Previsões
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {!ehAdmin && !cadastrado && (
            <Link
              href="/cadastro"
              className="rounded-lg bg-teal px-3.5 py-1.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
            >
              Cadastre-se
            </Link>
          )}
          {ehAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal/50 bg-teal/10 px-3 py-1.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span className="hidden sm:inline">Painel admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}
          <NotificationBell notificacoes={notificacoes} />
        </div>
      </div>
    </header>
  );
}
