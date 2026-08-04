import { z } from "zod";

/** Validação do formulário de criação/edição de seção (admin). */
export const secaoSchema = z.object({
  titulo: z.string().trim().min(3, "Informe um título (mín. 3 caracteres)."),
  icone: z.string().trim().max(8, "Use apenas um emoji.").optional().or(z.literal("")),
  nivel: z.enum(["R1", "R+"], { message: "Selecione o nível." }),
  tipoPadrao: z.enum(["youtube", "arquivo"]),
  acesso: z.enum(["aberto", "cadastro"], { message: "Defina o acesso." }),
});

export type SecaoInput = z.infer<typeof secaoSchema>;
