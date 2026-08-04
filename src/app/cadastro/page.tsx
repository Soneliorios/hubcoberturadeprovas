import Image from "next/image";
import CadastroForm from "@/components/CadastroForm";

export default function CadastroPage() {
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
            Cadastre-se para acessar ultra revisões, previsões Medbrain e lives
            de correção da sua prova.
          </p>
        </div>

        {/* Cartão do formulário */}
        <div className="rounded-2xl border border-border bg-surface/60 p-6 shadow-2xl backdrop-blur sm:p-8">
          <CadastroForm />
        </div>
      </div>
    </main>
  );
}
