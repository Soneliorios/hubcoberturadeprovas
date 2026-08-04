"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { novoUsuarioSchema, redefinirSenhaSchema } from "@/lib/usuario-schema";
import {
  criarUsuario,
  emailExiste,
  excluirUsuario,
  contarUsuarios,
  redefinirSenha,
} from "@/server/usuarios";

export interface UsuarioFormState {
  ok: boolean;
  erros?: Record<string, string>;
  mensagem?: string;
}

async function exigirAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado.");
  return session;
}

function coletarErros(
  issues: readonly { path: readonly PropertyKey[]; message: string }[]
): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const i of issues) {
    const campo = i.path[0] != null ? String(i.path[0]) : "form";
    if (!erros[campo]) erros[campo] = i.message;
  }
  return erros;
}

/** Cria um novo admin (somente admin logado). */
export async function criarUsuarioAction(
  _prev: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await exigirAdmin();

  const parsed = novoUsuarioSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues) };
  }

  if (await emailExiste(parsed.data.email)) {
    return { ok: false, erros: { email: "Já existe um admin com este e-mail." } };
  }

  await criarUsuario(parsed.data);
  revalidatePath("/admin/usuarios");
  return { ok: true, mensagem: `Admin ${parsed.data.nome} criado com sucesso.` };
}

/** Redefine a senha de um admin. */
export async function redefinirSenhaAction(
  _prev: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = redefinirSenhaSchema.safeParse({ senha: formData.get("senha") });
  if (!id) return { ok: false, mensagem: "Usuário inválido." };
  if (!parsed.success) {
    return { ok: false, erros: coletarErros(parsed.error.issues) };
  }
  await redefinirSenha(id, parsed.data.senha);
  revalidatePath("/admin/usuarios");
  return { ok: true, mensagem: "Senha redefinida com sucesso." };
}

/** Exclui um admin (não pode excluir a si mesmo nem o último admin). */
export async function excluirUsuarioAction(formData: FormData): Promise<void> {
  const session = await exigirAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Não permitir excluir a própria conta.
  if (session.user?.id === id) return;

  // Não permitir ficar sem nenhum admin.
  const total = await contarUsuarios();
  if (total <= 1) return;

  await excluirUsuario(id);
  revalidatePath("/admin/usuarios");
}
