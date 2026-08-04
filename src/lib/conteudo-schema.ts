import { z } from "zod";
import { ESTADOS } from "@/data/estados";

const UFS = ESTADOS.map((e) => e.uf) as [string, ...string[]];

/** Validação do formulário de criação/edição de conteúdo (admin).
 *  A existência da seção é garantida pelo FK no banco. */
export const conteudoSchema = z.object({
  titulo: z.string().trim().min(3, "Informe um título (mín. 3 caracteres)."),
  descricao: z.string().trim().max(500).optional().or(z.literal("")),
  secaoId: z.string().min(1, "Selecione uma seção."),
  /** "herdar" segue a seção; "aberto"/"cadastro" sobrescrevem por conteúdo */
  acesso: z.enum(["herdar", "aberto", "cadastro"]).default("herdar"),
  tipo: z.enum(["youtube", "arquivo"]),
  url: z.string().trim().url("Informe uma URL válida."),
  prova: z.string().trim().max(60).optional().or(z.literal("")),
  estados: z.array(z.enum(UFS)).default([]),
  thumbnail: z.string().trim().url().optional().or(z.literal("")),
  duracaoMin: z.coerce.number().int().positive().max(1000).optional(),
});

export type ConteudoInput = z.infer<typeof conteudoSchema>;
