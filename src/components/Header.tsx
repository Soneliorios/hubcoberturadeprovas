import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { NOTIFICACOES } from "@/data/conteudos";

/** Header fixo no topo (escopo): logo + sino de notificações, fundo sólido dark. */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo />
        <NotificationBell notificacoes={NOTIFICACOES} />
      </div>
    </header>
  );
}
