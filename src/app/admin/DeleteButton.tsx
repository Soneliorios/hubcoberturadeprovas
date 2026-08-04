"use client";

import { excluirConteudoAction } from "./actions";

export default function DeleteButton({ id, titulo }: { id: string; titulo: string }) {
  return (
    <form
      action={excluirConteudoAction}
      onSubmit={(e) => {
        if (!confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-error/60 hover:text-error"
      >
        Excluir
      </button>
    </form>
  );
}
