import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getConteudoParaVisualizacao } from "@/server/conteudos";
import { estaCadastrado } from "@/server/leads";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function tipoDePreview(url: string): "pdf" | "imagem" | "outro" {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path.endsWith(".pdf")) return "pdf";
    if (/\.(png|jpe?g|webp|gif)$/.test(path)) return "imagem";
    return "outro";
  } catch {
    return "outro";
  }
}

/** Força download nas URLs públicas do Supabase Storage (?download=nome). */
function urlDownload(url: string, titulo: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes("/storage/v1/object/public/")) {
      u.searchParams.set("download", titulo);
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export default async function ArquivoPage({
  params,
}: PageProps<"/conteudos/arquivo/[id]">) {
  const { id } = await params;
  const [cadastrado, session] = await Promise.all([estaCadastrado(), auth()]);
  const desbloqueado = cadastrado || !!session?.user;
  const c = await getConteudoParaVisualizacao(id, desbloqueado);
  if (!c) notFound();

  const preview = c.restrito ? "outro" : tipoDePreview(c.url);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6">
          <Link
            href={`/conteudos/${c.secaoId}`}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            {c.secaoTitulo}
          </Link>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">{c.titulo}</h1>
              {c.prova && <p className="mt-0.5 text-sm text-muted">{c.prova}</p>}
              {c.descricao && (
                <p className="mt-2 max-w-2xl text-sm text-muted">{c.descricao}</p>
              )}
            </div>

            {!c.restrito && (
              <a
                href={urlDownload(c.url, c.titulo)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Baixar arquivo
              </a>
            )}
          </div>

          {c.restrito ? (
            /* Gate: conteúdo exclusivo para cadastrados */
            <div className="grid place-items-center rounded-2xl border border-border bg-surface px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-teal/15 text-teal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <p className="mt-3 font-bold">Conteúdo exclusivo para cadastrados</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Faça seu cadastro gratuito para visualizar e baixar este arquivo.
              </p>
              <div className="mt-5 flex w-full max-w-xs flex-col items-center gap-2">
                <Link
                  href={`/cadastro?voltar=/conteudos/arquivo/${c.id}`}
                  className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong"
                >
                  Fazer cadastro grátis
                </Link>
                <Link
                  href={`/cadastro?modo=entrar&voltar=/conteudos/arquivo/${c.id}`}
                  className="text-xs font-semibold text-muted hover:text-foreground"
                >
                  Já tem cadastro? <span className="text-teal">Entrar</span>
                </Link>
              </div>
            </div>
          ) : preview === "pdf" ? (
            <iframe
              src={c.url}
              title={c.titulo}
              className="h-[75vh] w-full rounded-2xl border border-border bg-white"
            />
          ) : preview === "imagem" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.url}
              alt={c.titulo}
              className="mx-auto max-h-[80vh] w-auto max-w-full rounded-2xl border border-border"
            />
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
              <span className="text-4xl" aria-hidden>
                📄
              </span>
              <p className="mt-3 text-sm text-muted">
                Este tipo de arquivo não tem visualização no navegador.
                <br />
                Use o botão <span className="font-semibold text-foreground">Baixar arquivo</span> acima.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
