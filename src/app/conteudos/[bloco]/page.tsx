import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ContentCard from "@/components/ContentCard";
import { getConteudosDoBloco } from "@/server/conteudos";

export const dynamic = "force-dynamic";

export default async function BlocoPage({
  params,
}: PageProps<"/conteudos/[bloco]">) {
  const { bloco: blocoId } = await params;
  const dados = await getConteudosDoBloco(blocoId);
  if (!dados) notFound();
  const { bloco } = dados;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
          <Link
            href="/conteudos"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Voltar
          </Link>

          <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold">
            {bloco.icone && <span aria-hidden>{bloco.icone}</span>}
            {bloco.titulo}
          </h1>
          <p className="mb-6 text-sm text-muted">
            {bloco.itens.length} conteúdo{bloco.itens.length === 1 ? "" : "s"} disponíve{bloco.itens.length === 1 ? "l" : "is"}
          </p>

          {bloco.itens.length === 0 ? (
            <p className="py-16 text-center text-muted">
              Nenhum conteúdo neste bloco ainda.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] justify-items-center gap-4">
              {bloco.itens.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
