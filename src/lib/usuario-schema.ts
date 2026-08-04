import { z } from "zod";

/** Validação para criar um novo admin (feito por um admin existente). */
export const novoUsuarioSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome (mín. 3 caracteres)."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export type NovoUsuarioInput = z.infer<typeof novoUsuarioSchema>;

/** Validação para redefinir a senha de um admin. */
export const redefinirSenhaSchema = z.object({
  senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});
