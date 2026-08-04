"use server";

import { auth } from "@/auth";
import { criarUploadAssinado } from "@/server/storage";

export interface UploadUrlResult {
  ok: boolean;
  erro?: string;
  uploadUrl?: string;
  publicUrl?: string;
}

/** Gera autorização de upload direto ao Storage (somente admin logado). */
export async function gerarUploadUrlAction(
  nomeArquivo: string,
  contentType: string,
  destino: "arquivo" | "thumb"
): Promise<UploadUrlResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, erro: "Não autorizado." };

  if (destino !== "arquivo" && destino !== "thumb") {
    return { ok: false, erro: "Destino inválido." };
  }

  try {
    const { uploadUrl, publicUrl } = await criarUploadAssinado(
      nomeArquivo,
      contentType,
      destino
    );
    return { ok: true, uploadUrl, publicUrl };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Falha ao autorizar o upload.",
    };
  }
}
