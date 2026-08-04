/** Banner de confirmação exibido após o cadastro (?cadastro=ok)
 *  ou após entrar com o e-mail (?cadastro=login). */
export default function BannerCadastroOk({
  variante = "cadastro",
}: {
  variante?: "cadastro" | "login";
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6">
      <div className="flex items-center gap-2.5 rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm">
        <span aria-hidden>{variante === "cadastro" ? "🎉" : "👋"}</span>
        <p>
          <span className="font-bold text-teal">
            {variante === "cadastro" ? "Cadastro concluído!" : "Bem-vindo de volta!"}
          </span>{" "}
          <span className="text-foreground/90">
            Todos os conteúdos foram desbloqueados neste navegador.
          </span>
        </p>
      </div>
    </div>
  );
}
