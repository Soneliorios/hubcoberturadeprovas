/**
 * Cria (ou atualiza a senha de) uma conta de admin.
 *
 * Uso:
 *   npm run create-admin -- --nome "Sonélio" --email "voce@medway.com.br" --senha "SuaSenhaForte"
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function arg(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const nome = arg("nome");
  const email = arg("email")?.toLowerCase();
  const senha = arg("senha");

  if (!nome || !email || !senha) {
    console.error(
      'Faltam argumentos. Ex.: npm run create-admin -- --nome "Nome" --email "email@dominio" --senha "senha"'
    );
    process.exit(1);
  }
  if (senha.length < 8) {
    console.error("A senha deve ter ao menos 8 caracteres.");
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { nome, senhaHash, role: "admin" },
    create: { nome, email, senhaHash, role: "admin" },
  });

  console.log(`✔ Admin pronto: ${user.nome} <${user.email}>`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
