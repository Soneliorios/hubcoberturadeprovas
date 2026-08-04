import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ContentCard from "@/components/ContentCard";
import BannerCadastroOk from "@/components/BannerCadastroOk";
import ConteudosBloqueadosCTA from "@/components/ConteudosBloqueadosCTA";
import { getSecaoComConteudos } from "@/server/conteudos";
import { estaCadastrado } from "@/server/leads";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SecaoPage({
  params,
  searchParams,
}: PageProps<"/conteudos/[bloco]">) {
  const { bloco: secaoId } = await params;
  const [cadastrado, session, sp] = await Promise.all([
    estaCadastrado(),
    auth(),
    searchParams,
  ]);
  const desbloqueado = cadastrado || !!session?.user;
  const dados = await getSecaoComConteudos(secaoId, desbloqueado);
  if (!dados) notFound();
  const { secao, bloqueada, itens, bloqueados, total } = dados;
  // Seção restrita mas vazia não promete nada — trata como seção vazia.
  const mostrarBloqueio = bloqueada && total > 0;

  return (
    <>
      <Header />
      <main className="flex-1">
        {(sp.cadastro === "ok" || sp.cadastro === "login") && (
          <BannerCadastroOk
            variante={sp.cadastro === "login" ? "login" : "cadastro"}
          />
        )}
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
            {secao.icone && <span aria-hidden>{secao.icone}</span>}
            {secao.titulo}
          </h1>
          <p className="mb-6 text-sm text-muted">
            {mostrarBloqueio
              ? `${total} conteúdo${total === 1 ? "" : "s"} exclusivo${total === 1 ? "" : "s"} para cadastrados`
              : bloqueados > 0
                ? `${total} conteúdo${total === 1 ? "" : "s"} · ${bloqueados} exclusivo${bloqueados === 1 ? "" : "s"} para cadastrados`
                : `${total} conteúdo${total === 1 ? "" : "s"} disponíve${total === 1 ? "l" : "is"}`}
          </p>

          {mostrarBloqueio ? (
            <div className="relative">
              {/* Grade de placeholders borrada (nenhum dado real) */}
              <div className="pointer-events-none grid select-none grid-cols-[repeat(auto-fill,minmax(248px,1fr))] justify-items-center gap-4 blur-[6px]">
                {Array.from({ length: Math.min(Math.max(total, 3), 8) }, (_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="w-[248px] overflow-hidden rounded-xl border border-border bg-surface"
                  >
                    <div className="grid aspect-video place-items-center bg-gradient-to-br from-navy/70 to-surface-2">
                      <span className="text-3xl opacity-50">
                        {secao.tipoPadrao === "youtube" ? "🎥" : "📄"}
                      </span>
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-16 rounded-full bg-surface-2" />
                      <div className="h-3.5 w-4/5 rounded bg-surface-2" />
                      <div className="h-3.5 w-3/5 rounded bg-surface-2" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/40">
                <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-surface/95 px-6 py-5 text-center shadow-2xl backdrop-blur">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-teal/15 text-teal">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-bold">Conteúdo exclusivo para cadastrados</p>
                    <p className="mt-1 text-sm text-muted">
                      Faça seu cadastro gratuito para desbloquear esta seção.
                    </p>
                  </div>
                  <Link
                    href={`/cadastro?voltar=/conteudos/${secao.id}`}
                    className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
                  >
                    Fazer cadastro grátis
                  </Link>
                  <Link
                    href={`/cadastro?modo=entrar&voltar=/conteudos/${secao.id}`}
                    className="text-xs font-semibold text-muted hover:text-foreground"
                  >
                    Já tem cadastro? <span className="text-teal">Entrar</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : itens.length === 0 && bloqueados === 0 ? (
            <p className="py-16 text-center text-muted">
              Nenhum conteúdo nesta seção ainda.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] justify-items-center gap-4">
                {itens.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
              {bloqueados > 0 && (
                <div className="mt-6">
                  <ConteudosBloqueadosCTA
                    secao={secao}
                    quantidade={bloqueados}
                    layout="grade"
                    voltar={`/conteudos/${secao.id}`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
