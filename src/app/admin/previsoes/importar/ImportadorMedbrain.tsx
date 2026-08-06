"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Uploader from "../../Uploader";
import { extrairAction, importarAction } from "./actions";
import { ESTADOS } from "@/data/estados";

type Etapa = "upload" | "extraindo" | "revisao";

interface Linha {
  incluir: boolean;
  especialidade: string;
  titulo: string;
  descricao: string;
}

export default function ImportadorMedbrain() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("upload");
  const [erro, setErro] = useState<string | null>(null);

  // dados da prova (revisão)
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("");
  const [estado, setEstado] = useState("");
  const [dataProva, setDataProva] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);

  const [salvando, iniciarSalvar] = useTransition();

  const selecionadas = useMemo(
    () => linhas.filter((l) => l.incluir && l.titulo.trim().length >= 3).length,
    [linhas]
  );

  async function aoEnviarPdf(publicUrl: string, nomeArquivo: string) {
    setErro(null);
    setEtapa("extraindo");
    const res = await extrairAction(publicUrl);
    if (!res.ok || !res.dados) {
      setErro(res.erro ?? "Falha ao ler o PDF.");
      setEtapa("upload");
      return;
    }
    const d = res.dados;
    setNome(d.provaNome || nomeArquivo.replace(/\.pdf$/i, ""));
    setLinhas(
      d.previsoes.map((p) => ({
        incluir: true,
        especialidade: p.especialidade,
        titulo: p.titulo,
        descricao: p.descricao,
      }))
    );
    setEtapa("revisao");
  }

  function atualizarLinha(i: number, campo: keyof Linha, valor: string | boolean) {
    setLinhas((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l))
    );
  }

  function marcarTodas(incluir: boolean) {
    setLinhas((prev) => prev.map((l) => ({ ...l, incluir })));
  }

  function salvar() {
    setErro(null);
    const previsoes = linhas
      .filter((l) => l.incluir)
      .map((l) => ({
        titulo: l.titulo.trim(),
        especialidade: l.especialidade.trim() || undefined,
        descricao: l.descricao.trim() || undefined,
      }))
      .filter((p) => p.titulo.length >= 3);

    if (nome.trim().length < 3) {
      setErro("Dê um nome à prova (mín. 3 caracteres).");
      return;
    }
    if (previsoes.length === 0) {
      setErro("Selecione ao menos uma previsão.");
      return;
    }

    iniciarSalvar(async () => {
      const res = await importarAction({
        nome: nome.trim(),
        nivel: nivel || undefined,
        estado: estado || undefined,
        dataProva: dataProva || undefined,
        previsoes,
      });
      if (!res.ok || !res.provaId) {
        setErro(res.erro ?? "Falha ao criar a prova.");
        return;
      }
      router.push(`/admin/previsoes/${res.provaId}`);
    });
  }

  /* ----------------------- Etapa: upload ----------------------- */
  if (etapa === "upload") {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-2xl">
            🔮
          </div>
          <div>
            <h2 className="text-lg font-bold">Importar previsões de um PDF</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Envie o PDF de previsões do MedBrain. A IA lê o arquivo, identifica
              a prova pela capa e extrai os temas para você revisar antes de criar
              a prova.
            </p>
          </div>
          <Uploader
            destino="arquivo"
            accept="application/pdf,.pdf"
            rotulo="Escolher PDF do MedBrain"
            onUpload={aoEnviarPdf}
          />
        </div>
        {erro && (
          <p className="mt-2 rounded-lg bg-error/10 px-3 py-2 text-center text-sm text-error">
            {erro}
          </p>
        )}
      </div>
    );
  }

  /* ---------------------- Etapa: extraindo --------------------- */
  if (etapa === "extraindo") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        <p className="text-sm font-semibold">Lendo o PDF com a IA…</p>
        <p className="max-w-sm text-xs text-muted">
          Isso pode levar de 20 a 60 segundos. Estou identificando a prova e
          extraindo cada previsão do material.
        </p>
      </div>
    );
  }

  /* ---------------------- Etapa: revisão ----------------------- */
  return (
    <div className="space-y-5">
      {/* Dados da prova */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="mb-4 text-base font-bold">Dados da prova</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px_150px]">
          <div>
            <label htmlFor="imp-nome" className="mb-1.5 block text-sm font-semibold">
              Nome da prova
            </label>
            <input
              id="imp-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Edição HIAE"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="imp-nivel" className="mb-1.5 block text-sm font-semibold">
              Nível
            </label>
            <select
              id="imp-nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="input"
            >
              <option value="">—</option>
              <option value="R1">Acesso Direto (R1)</option>
              <option value="R+">Especialidade (R+)</option>
            </select>
          </div>
          <div>
            <label htmlFor="imp-estado" className="mb-1.5 block text-sm font-semibold">
              Estado
            </label>
            <select
              id="imp-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="input"
            >
              <option value="">—</option>
              {ESTADOS.map((e) => (
                <option key={e.uf} value={e.uf}>
                  {e.uf}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="imp-data" className="mb-1.5 block text-sm font-semibold">
            Data da prova (opcional)
          </label>
          <input
            id="imp-data"
            type="datetime-local"
            value={dataProva}
            onChange={(e) => setDataProva(e.target.value)}
            className="input sm:w-64"
          />
        </div>
      </div>

      {/* Previsões extraídas */}
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold">
            {linhas.length} previsõe{linhas.length === 1 ? "" : "s"} encontrada
            {linhas.length === 1 ? "" : "s"}
            <span className="ml-2 text-sm font-medium text-muted">
              · {selecionadas} selecionada{selecionadas === 1 ? "" : "s"}
            </span>
          </h2>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => marcarTodas(true)}
              className="rounded-md border border-border px-2 py-1 font-semibold text-muted hover:text-foreground"
            >
              Selecionar todas
            </button>
            <button
              type="button"
              onClick={() => marcarTodas(false)}
              className="rounded-md border border-border px-2 py-1 font-semibold text-muted hover:text-foreground"
            >
              Limpar
            </button>
          </div>
        </div>
        <p className="mb-4 text-xs text-muted">
          Revise, ajuste o que a IA errou e desmarque o que não quiser importar.
        </p>

        <ul className="space-y-3">
          {linhas.map((l, i) => (
            <li
              key={i}
              className={`rounded-xl border p-3 transition-colors ${
                l.incluir ? "border-border bg-surface-2/40" : "border-border/50 opacity-55"
              }`}
            >
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={l.incluir}
                  onChange={(e) => atualizarLinha(i, "incluir", e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-teal,#01CFAB)]"
                  aria-label={`Incluir ${l.titulo}`}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    value={l.especialidade}
                    onChange={(e) => atualizarLinha(i, "especialidade", e.target.value)}
                    placeholder="Especialidade"
                    className="input h-8 w-full max-w-[260px] py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={l.titulo}
                    onChange={(e) => atualizarLinha(i, "titulo", e.target.value)}
                    placeholder="Título da previsão"
                    className="input w-full py-1.5 font-semibold"
                  />
                  <textarea
                    value={l.descricao}
                    onChange={(e) => atualizarLinha(i, "descricao", e.target.value)}
                    rows={2}
                    placeholder="Descrição (opcional)"
                    className="input w-full resize-none py-1.5 text-sm"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {erro && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{erro}</p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setEtapa("upload");
            setLinhas([]);
            setErro(null);
          }}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          ← Enviar outro PDF
        </button>
        <button
          type="button"
          disabled={salvando || selecionadas === 0}
          onClick={salvar}
          className="rounded-lg bg-teal px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-50"
        >
          {salvando
            ? "Criando…"
            : `Criar prova com ${selecionadas} previsõe${selecionadas === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
