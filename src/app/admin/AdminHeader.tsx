import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "./logout-action";

/** Cabeçalho fixo da área de admin. */
export default function AdminHeader({ nome }: { nome?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/brand/medway-logo.png"
            alt="Medway"
            width={110}
            height={26}
            className="h-6 w-auto"
          />
          <span className="hidden sm:inline text-sm font-semibold text-muted">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/conteudos"
            className="hidden sm:inline rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            Ver site
          </Link>
          {nome && (
            <span className="hidden text-sm text-muted md:inline">{nome}</span>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted hover:border-error/50 hover:text-error"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
