"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  alternarAcessoAction,
  excluirSecaoAction,
  moverSecaoAction,
} from "./actions";

/** Botão que se desabilita enquanto a action do form está pendente
 *  (evita duplo clique em mover/restringir/excluir). */
function BotaoPendente({
  children,
  disabled,
  title,
  ariaLabel,
  className,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      title={title}
      aria-label={ariaLabel}
      aria-busy={pending}
      className={className}
    >
      {children}
    </button>
  );
}

export default function SecaoAcoes({
  id,
  titulo,
  acesso,
  totalConteudos,
  primeira,
  ultima,
}: {
  id: string;
  titulo: string;
  acesso: string;
  totalConteudos: number;
  primeira: boolean;
  ultima: boolean;
}) {
  const podeExcluir = totalConteudos === 0;
  const classeIcone =
    "grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-teal/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30";
  const classeBotao =
    "rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/60 hover:text-foreground disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Reordenar */}
      <form action={moverSecaoAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direcao" value="cima" />
        <BotaoPendente disabled={primeira} ariaLabel="Mover para cima" className={classeIcone}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m18 15-6-6-6 6" />
          </svg>
        </BotaoPendente>
      </form>
      <form action={moverSecaoAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direcao" value="baixo" />
        <BotaoPendente disabled={ultima} ariaLabel="Mover para baixo" className={classeIcone}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </BotaoPendente>
      </form>

      {/* Alternar acesso */}
      <form action={alternarAcessoAction}>
        <input type="hidden" name="id" value={id} />
        <BotaoPendente
          title={
            acesso === "aberto"
              ? "Tornar exclusiva para cadastrados"
              : "Abrir ao público"
          }
          className={classeBotao}
        >
          {acesso === "aberto" ? "🔒 Restringir" : "🌐 Abrir"}
        </BotaoPendente>
      </form>

      <Link
        href={`/admin/secoes/${id}/editar`}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/60 hover:text-foreground"
      >
        Editar
      </Link>

      <form
        action={excluirSecaoAction}
        onSubmit={(e) => {
          if (!podeExcluir) {
            e.preventDefault();
            return;
          }
          if (!confirm(`Excluir a seção "${titulo}"?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <BotaoPendente
          disabled={!podeExcluir}
          title={
            podeExcluir
              ? undefined
              : "Mova ou exclua os conteúdos desta seção antes de excluí-la."
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-error/60 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
        >
          Excluir
        </BotaoPendente>
      </form>
    </div>
  );
}
