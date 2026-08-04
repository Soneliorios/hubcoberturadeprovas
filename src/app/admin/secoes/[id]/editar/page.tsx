import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSecao } from "@/server/secoes";
import type { Acesso, ContentType, Nivel } from "@/lib/types";
import AdminHeader from "../../../AdminHeader";
import SecaoForm from "../../SecaoForm";
import { atualizarSecaoAction } from "../../actions";

export const metadata = { title: "Admin · Editar seção" };
export const dynamic = "force-dynamic";

export default async function EditarSecaoPage({
  params,
}: PageProps<"/admin/secoes/[id]/editar">) {
  const { id } = await params;
  const [session, secao] = await Promise.all([auth(), getSecao(id)]);
  if (!secao) notFound();

  const action = atualizarSecaoAction.bind(null, id);

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/admin/secoes"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <h1 className="mb-6 text-2xl font-bold">Editar seção</h1>
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <SecaoForm
            action={action}
            submitLabel="Salvar alterações"
            defaults={{
              titulo: secao.titulo,
              icone: secao.icone ?? undefined,
              nivel: (secao.nivel === "R+" ? "R+" : "R1") as Nivel,
              tipoPadrao: (secao.tipoPadrao === "arquivo"
                ? "arquivo"
                : "youtube") as ContentType,
              acesso: (secao.acesso === "cadastro"
                ? "cadastro"
                : "aberto") as Acesso,
            }}
          />
        </div>
      </main>
    </>
  );
}
