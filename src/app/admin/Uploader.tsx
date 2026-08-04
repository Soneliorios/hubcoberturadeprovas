"use client";

import { useRef, useState } from "react";
import { gerarUploadUrlAction } from "./upload-actions";

/**
 * Upload direto do navegador para o Supabase Storage (via URL assinada
 * gerada no servidor). Ao concluir, entrega a URL pública via onUpload.
 */
export default function Uploader({
  destino,
  accept,
  rotulo,
  onUpload,
}: {
  destino: "arquivo" | "thumb";
  accept: string;
  rotulo: string;
  onUpload: (publicUrl: string, nomeArquivo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErro(null);
    setEnviando(true);
    setProgresso(`Enviando ${f.name}…`);
    try {
      const res = await gerarUploadUrlAction(
        f.name,
        f.type || "application/octet-stream",
        destino
      );
      if (!res.ok || !res.uploadUrl || !res.publicUrl) {
        throw new Error(res.erro ?? "Falha ao autorizar o upload.");
      }
      const put = await fetch(res.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });
      if (!put.ok) {
        const corpo = await put.text();
        throw new Error(`Falha no envio (${put.status}): ${corpo.slice(0, 120)}`);
      }
      onUpload(res.publicUrl, f.name);
      setProgresso("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no upload.");
      setProgresso("");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={aoEscolher}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        disabled={enviando}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-teal/60 bg-teal/10 px-4 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20 disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m17 8-5-5-5 5" />
          <path d="M12 3v12" />
        </svg>
        {enviando ? progresso || "Enviando…" : rotulo}
      </button>
      {erro && <p className="mt-1 text-xs text-error">{erro}</p>}
    </div>
  );
}
