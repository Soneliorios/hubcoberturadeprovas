"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { extrairPrevisoesDoPdf, type ExtracaoMedbrain } from "@/server/medbrain";
import { criarProvaComPrevisoes } from "@/server/previsoes";

export interface ExtrairResult {
  ok: boolean;
  erro?: string;
  dados?: ExtracaoMedbrain;
}

/** Manda o PDF (já no Storage) para a IA extrair as previsões. */
export async function extrairAction(pdfUrl: string): Promise<ExtrairResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, erro: "Não autorizado." };
  if (!pdfUrl) return { ok: false, erro: "Arquivo não enviado." };
  try {
    const dados = await extrairPrevisoesDoPdf(pdfUrl);
    return { ok: true, dados };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Falha ao ler o PDF.",
    };
  }
}

export interface ImportarInput {
  nome: string;
  nivel?: string;
  estado?: string;
  dataProva?: string;
  previsoes: { titulo: string; especialidade?: string; descricao?: string }[];
}

export interface ImportarResult {
  ok: boolean;
  erro?: string;
  provaId?: string;
}

/** Cria a prova com as previsões revisadas pelo admin. */
export async function importarAction(
  input: ImportarInput
): Promise<ImportarResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, erro: "Não autorizado." };

  const nome = (input.nome ?? "").trim();
  if (nome.length < 3) {
    return { ok: false, erro: "Dê um nome à prova (mín. 3 caracteres)." };
  }

  const previsoes = (input.previsoes ?? [])
    .map((p) => ({
      titulo: (p.titulo ?? "").trim(),
      especialidade: (p.especialidade ?? "").trim() || undefined,
      descricao: (p.descricao ?? "").trim() || undefined,
    }))
    .filter((p) => p.titulo.length >= 3);

  if (previsoes.length === 0) {
    return { ok: false, erro: "Selecione ao menos uma previsão válida." };
  }

  try {
    const d = input.dataProva ? new Date(input.dataProva) : null;
    const prova = await criarProvaComPrevisoes({
      nome,
      nivel: input.nivel || undefined,
      estado: input.estado || undefined,
      dataProva: d && !isNaN(d.getTime()) ? d : null,
      previsoes,
    });
    revalidatePath("/admin/previsoes");
    revalidatePath("/previsoes");
    return { ok: true, provaId: prova.id };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Falha ao criar a prova.",
    };
  }
}
