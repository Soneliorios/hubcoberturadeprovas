import "server-only";
import { randomUUID } from "crypto";

/**
 * Upload direto do navegador para o Supabase Storage via URL assinada:
 * o servidor (service role) gera a autorização; o arquivo NÃO passa pela
 * Vercel (evita o limite de 4,5MB por request das functions).
 */

const BUCKET = "conteudos";

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL não configurada no .env");
  return url.replace(/\/$/, "");
}

function serviceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no .env");
  return key;
}

/** Tipos aceitos por destino de upload. */
const TIPOS_PERMITIDOS: Record<"arquivo" | "thumb", RegExp> = {
  arquivo:
    /^(application\/pdf|application\/zip|application\/x-zip-compressed|application\/msword|application\/vnd\.openxmlformats-officedocument\.[a-z.]+|application\/vnd\.ms-(excel|powerpoint)|image\/(png|jpe?g|webp))$/i,
  thumb: /^image\/(png|jpe?g|webp)$/i,
};

function sanitizarNome(nome: string): string {
  const semAcento = nome.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return semAcento
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80)
    .toLowerCase();
}

export interface UploadAssinado {
  /** URL para o PUT do arquivo (direto no Storage) */
  uploadUrl: string;
  /** URL pública final (vai no campo url/thumbnail do conteúdo) */
  publicUrl: string;
}

/** Gera a URL assinada de upload. Lança erro para tipo não permitido. */
export async function criarUploadAssinado(
  nomeArquivo: string,
  contentType: string,
  destino: "arquivo" | "thumb"
): Promise<UploadAssinado> {
  if (!TIPOS_PERMITIDOS[destino].test(contentType)) {
    throw new Error(
      destino === "thumb"
        ? "A capa deve ser uma imagem (PNG, JPG ou WebP)."
        : "Tipo de arquivo não permitido (use PDF, ZIP, Office ou imagem)."
    );
  }

  const pasta = destino === "thumb" ? "thumbs" : "arquivos";
  const path = `${pasta}/${randomUUID().slice(0, 8)}-${sanitizarNome(nomeArquivo)}`;

  const res = await fetch(
    `${supabaseUrl()}/storage/v1/object/upload/sign/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
  if (!res.ok) {
    const corpo = await res.text();
    throw new Error(`Falha ao autorizar upload (${res.status}): ${corpo.slice(0, 200)}`);
  }
  const dados = (await res.json()) as { url: string };

  return {
    uploadUrl: `${supabaseUrl()}/storage/v1${dados.url}`,
    publicUrl: `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${path}`,
  };
}
