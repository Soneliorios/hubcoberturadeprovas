import Link from "next/link";
import { auth } from "@/auth";
import AdminHeader from "../../AdminHeader";
import ImportadorMedbrain from "./ImportadorMedbrain";

export const metadata = { title: "Admin · Importar previsões" };
export const dynamic = "force-dynamic";

export default async function ImportarPrevisoesPage() {
  const session = await auth();

  return (
    <>
      <AdminHeader nome={session?.user?.name} />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/admin/previsoes"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          Previsões
        </Link>

        <div className="mb-5">
          <h1 className="text-2xl font-bold">Importar previsões (MedBrain)</h1>
          <p className="text-sm text-muted">
            A IA lê o PDF, identifica a prova pela capa e extrai os temas. Você
            revisa e cria a prova com um clique.
          </p>
        </div>

        <ImportadorMedbrain />
      </main>
    </>
  );
}
