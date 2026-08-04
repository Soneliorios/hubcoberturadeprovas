import Link from "next/link";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { NOTIFICACOES } from "@/data/conteudos";
import { auth } from "@/auth";

/** Header fixo no topo (escopo): logo + sino de notificações, fundo sólido dark.
 *  Para admins logados, mostra também um atalho de volta ao painel. */
export default async function Header() {
  const session = await auth();
  const ehAdmin = !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
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
          <NotificationBell notificacoes={NOTIFICACOES} />
        </div>
      </div>
    </header>
  );
}
