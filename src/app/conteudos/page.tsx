import Header from "@/components/Header";
import HubContent from "@/components/HubContent";
import BannerCadastroOk from "@/components/BannerCadastroOk";
import { getSecoesComConteudos } from "@/server/conteudos";
import { estaCadastrado } from "@/server/leads";
import { auth } from "@/auth";

// Lê do banco a cada acesso (conteúdo gerenciado pelo admin).
export const dynamic = "force-dynamic";

export default async function ConteudosPage({
  searchParams,
}: PageProps<"/conteudos">) {
  // Admin logado enxerga tudo; visitante precisa do cookie de cadastro.
  const [cadastrado, session, sp] = await Promise.all([
    estaCadastrado(),
    auth(),
    searchParams,
  ]);
  const desbloqueado = cadastrado || !!session?.user;
  const secoes = await getSecoesComConteudos(desbloqueado);

  return (
    <>
      <Header />
      <main className="flex-1">
        {(sp.cadastro === "ok" || sp.cadastro === "login") && (
          <BannerCadastroOk
            variante={sp.cadastro === "login" ? "login" : "cadastro"}
          />
        )}
        <HubContent secoes={secoes} />
      </main>
    </>
  );
}
