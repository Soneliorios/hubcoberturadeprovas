import type { NextAuthConfig } from "next-auth";

/**
 * Config leve (compatível com o middleware/Edge): sem acesso a banco.
 * A verificação de senha fica no provider Credentials em `src/auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Protege todas as rotas /admin (exceto a própria /admin/login).
    authorized({ auth, request: { nextUrl } }) {
      const logado = !!auth?.user;
      const emAdmin = nextUrl.pathname.startsWith("/admin");
      const emLogin = nextUrl.pathname.startsWith("/admin/login");

      if (emLogin) {
        // Já logado tentando acessar /admin/login → manda pro painel
        if (logado) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }
      if (emAdmin) return logado; // exige login
      return true; // rotas públicas
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
        token.nome = (user as { nome?: string }).nome;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "admin";
        session.user.name = (token.nome as string) ?? session.user.name;
      }
      return session;
    },
  },
  providers: [], // definidos em src/auth.ts
};
