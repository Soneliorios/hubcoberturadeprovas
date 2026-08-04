import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proxy (Next 16, antigo "middleware"): usa apenas a config leve (sem Prisma/bcrypt).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protege /admin e subrotas. Ignora assets estáticos.
  matcher: ["/admin/:path*"],
};
