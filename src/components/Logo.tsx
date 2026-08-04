import Image from "next/image";
import Link from "next/link";

/** Logo oficial da Medway (versão para fundo escuro) + rótulo do produto. */
export default function Logo() {
  return (
    <Link href="/conteudos" className="flex items-center gap-3 shrink-0">
      {/* unoptimized: mesma URL crua da intro — 1 request, cache compartilhado */}
      <Image
        src="/brand/medway-logo.png"
        alt="Medway"
        width={132}
        height={27}
        priority
        unoptimized
        className="h-7 w-auto"
      />
      <span className="hidden sm:block h-6 w-px bg-border" aria-hidden />
      <span className="hidden sm:block text-sm font-semibold text-muted">
        Cobertura de Provas
      </span>
    </Link>
  );
}
