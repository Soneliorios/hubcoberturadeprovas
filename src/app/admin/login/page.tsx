import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin · Login | Cobertura de Provas" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/brand/medway-logo.png"
            alt="Medway"
            width={160}
            height={40}
            priority
            className="mx-auto h-9 w-auto"
          />
          <h1 className="mt-6 text-xl font-bold">Área do administrador</h1>
          <p className="mt-1 text-sm text-muted">
            Entre para gerenciar os conteúdos.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/60 p-6 shadow-2xl sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
