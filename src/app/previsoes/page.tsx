import Header from "@/components/Header";
import ProvaCard from "@/components/previsoes/ProvaCard";
import { listarProvasPublicas } from "@/server/previsoes";

export const metadata = {
  title: "Previsões | Central Cobertura de Provas",
};
export const dynamic = "force-dynamic";

export default async function PrevisoesPage() {
  const provas = await listarProvasPublicas();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
          {/* Hero */}
          <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-navy/50 to-surface p-6">
            <h1 className="text-2xl font-bold sm:text-3xl">🔮 Previsões</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Ache que um tema vai cair na prova? Vote! Veja o que a galera acha em
              tempo real e, quando o gabarito sair, descubra quantas você acertou.
            </p>
          </div>

          {provas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted">
              Ainda não há provas com previsões abertas. Volte em breve! 🔮
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {provas.map((p) => (
                <ProvaCard key={p.id} prova={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
