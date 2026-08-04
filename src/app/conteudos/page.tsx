import Header from "@/components/Header";
import HubContent from "@/components/HubContent";
import { getBlocosComConteudos } from "@/server/conteudos";

// Lê do banco a cada acesso (conteúdo gerenciado pelo admin).
export const dynamic = "force-dynamic";

export default async function ConteudosPage() {
  const blocos = await getBlocosComConteudos();
  return (
    <>
      <Header />
      <main className="flex-1">
        <HubContent blocos={blocos} />
      </main>
    </>
  );
}
