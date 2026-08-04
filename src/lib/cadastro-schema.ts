import { z } from "zod";
import { ESTADOS } from "@/data/estados";

const UFS = ESTADOS.map((e) => e.uf) as [string, ...string[]];

/** Validação do formulário público de cadastro (lead).
 *  Limites máximos protegem o banco/CRM contra payloads forjados. */
export const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "E-mail muito longo.")
    .email("Informe um e-mail válido."),
  telefone: z
    .string()
    .trim()
    .max(20, "Telefone inválido.")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  provas: z
    .array(z.enum(UFS))
    .min(1, "Selecione ao menos um estado/prova.")
    .max(27),
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
