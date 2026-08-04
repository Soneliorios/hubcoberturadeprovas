/**
 * Popula um banco VAZIO com as seções e conteúdos de exemplo
 * (src/data/conteudos.ts). Uso: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { BLOCOS } from "../src/data/conteudos";

const prisma = new PrismaClient();

async function main() {
  // A migração já cria as 6 seções — o guard olha apenas os conteúdos.
  const totalConteudos = await prisma.conteudo.count();
  if (totalConteudos > 0) {
    console.log(`Já existem ${totalConteudos} conteúdos. Seed ignorado.`);
    return;
  }

  let nS = 0;
  let nC = 0;
  for (const [ordem, bloco] of BLOCOS.entries()) {
    // upsert: convive com as seções que a migração já inseriu.
    await prisma.secao.upsert({
      where: { id: bloco.id },
      update: {},
      create: {
        id: bloco.id,
        titulo: bloco.titulo,
        icone: bloco.icone ?? null,
        nivel: bloco.nivel,
        tipoPadrao: bloco.tipoPadrao,
        acesso: "aberto",
        ordem,
      },
    });
    nS++;
    for (const item of bloco.itens) {
      await prisma.conteudo.create({
        data: {
          titulo: item.titulo,
          descricao: item.descricao ?? null,
          secaoId: bloco.id,
          nivel: bloco.nivel,
          tipo: item.tipo,
          url: item.url,
          prova: item.prova ?? null,
          estados: JSON.stringify(item.estados ?? []),
          thumbnail: item.thumbnail ?? null,
          duracaoMin: item.duracaoMin ?? null,
          publicadoEm: item.publicadoEm ? new Date(item.publicadoEm) : new Date(),
        },
      });
      nC++;
    }
  }
  console.log(`✔ ${nS} seções e ${nC} conteúdos inseridos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
