"use client";

/** Botão de submit que pede confirmação antes de enviar o form. */
export default function BotaoConfirmar({
  children,
  confirmar,
  className,
}: {
  children: React.ReactNode;
  confirmar: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmar)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
