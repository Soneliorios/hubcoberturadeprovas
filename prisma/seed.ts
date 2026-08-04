/**
 * Popula o banco com os conteúdos de exemplo (src/data/conteudos.ts).
 * Uso: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { BLOCOS } from "../src/data/conteudos";
import { BLOCOS_INFO } from "../src/data/blocos";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.conteudo.count();
  if (total > 0) {
    console.log(`Já existem ${total} conteúdos. Seed ignorado.`);
    return;
  }

  let n = 0;
  for (const bloco of BLOCOS) {
    const info = BLOCOS_INFO.find((b) => b.id === bloco.id);
    const nivel = info?.nivel ?? bloco.nivel;
    for (const item of bloco.itens) {
      await prisma.conteudo.create({
        data: {
          titulo: item.titulo,
          descricao: item.descricao ?? null,
          blocoId: bloco.id,
          nivel,
          tipo: item.tipo,
          url: item.url,
          prova: item.prova ?? null,
          estados: JSON.stringify(item.estados ?? []),
          thumbnail: item.thumbnail ?? null,
          duracaoMin: item.duracaoMin ?? null,
          publicadoEm: item.publicadoEm ? new Date(item.publicadoEm) : new Date(),
        },
      });
      n++;
    }
  }
  console.log(`✔ ${n} conteúdos inseridos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
