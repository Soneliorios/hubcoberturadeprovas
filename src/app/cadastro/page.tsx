import Image from "next/image";
import Link from "next/link";
import AcessoCard from "@/components/AcessoCard";
import { estaCadastrado } from "@/server/leads";

export const dynamic = "force-dynamic";

export default async function CadastroPage({
  searchParams,
}: PageProps<"/cadastro">) {
  const [cadastrado, sp] = await Promise.all([estaCadastrado(), searchParams]);
  const voltar = typeof sp.voltar === "string" ? sp.voltar : undefined;
  const modoInicial = sp.modo === "entrar" ? "entrar" : "cadastro";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {/* Orbs decorativos sutis (identidade Medway) */}
      <div
        aria-hidden
        className="pointer-events-none fixed -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-teal opacity-[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-blue opacity-[0.08] blur-3xl"
      />

      <div className="relative w-full max-w-md">
        {/* Logo + cabeçalho */}
        <div className="mb-8 text-center">
          {/* unoptimized: mesma URL crua da intro — 1 request, cache compartilhado */}
          <Image
            src="/brand/medway-logo.png"
            alt="Medway"
            width={180}
            height={37}
            priority
            unoptimized
            className="mx-auto h-10 w-auto"
          />
          <h1 className="mt-6 text-2xl font-bold sm:text-3xl">
            Central Cobertura de Provas
          </h1>
          <p className="mt-2 text-sm text-muted">
            Cadastre-se gratuitamente para desbloquear todos os conteúdos:
            ultra revisões, previsões Medbrain e lives de correção.
          </p>
        </div>

        {/* Cartão */}
        <div className="rounded-2xl border border-border bg-surface/60 p-6 shadow-2xl backdrop-blur sm:p-8">
          {cadastrado ? (
            <div className="text-center">
              <span className="text-3xl" aria-hidden>
                ✅
              </span>
              <h2 className="mt-3 text-lg font-bold">Você já está cadastrado!</h2>
              <p className="mt-1 text-sm text-muted">
                Todos os conteúdos já estão desbloqueados neste navegador.
              </p>
              <Link
                href="/conteudos"
                className="mt-5 inline-block w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong"
              >
                Ir para os conteúdos
              </Link>
            </div>
          ) : (
            <AcessoCard modoInicial={modoInicial} voltar={voltar} />
          )}
        </div>

        <p className="mt-4 text-center">
          <Link
            href="/conteudos"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            Continuar sem cadastro →
          </Link>
        </p>
      </div>
    </main>
  );
}
