import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getConteudo, toSecaoInfo } from "@/server/conteudos";
import { listarSecoes } from "@/server/secoes";
import type { ContentType, UF } from "@/lib/types";
import AdminHeader from "../../AdminHeader";
import ConteudoForm from "../../ConteudoForm";
import { atualizarConteudoAction } from "../../actions";

export const metadata = { title: "Admin · Editar conteúdo" };
export const dynamic = "force-dynamic";

export default async function EditarConteudoPage({
  params,
}: PageProps<"/admin/[id]/editar">) {
  const { id } = await params;
  const [session, conteudo, secoes] = await Promise.all([
    auth(),
    getConteudo(id),
    listarSecoes(),
  ]);
  if (!conteudo) notFound();

  let estados: UF[] = [];
  try {
    estados = JSON.parse(conteudo.estados) as UF[];
  } catch {
    estados = [];
  }

  // Vincula o id à action de atualização.
  const action = atualizarConteudoAction.bind(null, id);

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <h1 className="mb-6 text-2xl font-bold">Editar conteúdo</h1>
        <ConteudoForm
          action={action}
          secoes={secoes.map(toSecaoInfo)}
          submitLabel="Salvar alterações"
          defaults={{
            titulo: conteudo.titulo,
            descricao: conteudo.descricao ?? undefined,
            secaoId: conteudo.secaoId,
            acesso: (["aberto", "cadastro"].includes(conteudo.acesso)
              ? conteudo.acesso
              : "herdar") as "herdar" | "aberto" | "cadastro",
            tipo: (conteudo.tipo === "arquivo" ? "arquivo" : "youtube") as ContentType,
            url: conteudo.url,
            prova: conteudo.prova ?? undefined,
            estados,
            thumbnail: conteudo.thumbnail ?? undefined,
            duracaoMin: conteudo.duracaoMin ?? undefined,
          }}
        />
      </main>
    </>
  );
}
