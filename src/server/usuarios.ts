import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NovoUsuarioInput } from "@/lib/usuario-schema";
import type { User } from "@prisma/client";

export type UsuarioResumo = Pick<User, "id" | "nome" | "email" | "criadoEm">;

export async function listarUsuarios(): Promise<UsuarioResumo[]> {
  return prisma.user.findMany({
    select: { id: true, nome: true, email: true, criadoEm: true },
    orderBy: { criadoEm: "asc" },
  });
}

export async function contarUsuarios(): Promise<number> {
  return prisma.user.count();
}

export async function emailExiste(email: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { email } });
  return !!u;
}

export async function criarUsuario(input: NovoUsuarioInput): Promise<User> {
  const senhaHash = await bcrypt.hash(input.senha, 10);
  return prisma.user.create({
    data: {
      nome: input.nome,
      email: input.email,
      senhaHash,
      role: "admin",
    },
  });
}

export async function redefinirSenha(id: string, senha: string): Promise<void> {
  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.user.update({ where: { id }, data: { senhaHash } });
}

export async function excluirUsuario(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}
