"use client";

import { useFormStatus } from "react-dom";
import { excluirConteudoAction } from "./actions";

function BotaoExcluir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-error/60 hover:text-error disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}

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
      <BotaoExcluir />
    </form>
  );
}
