import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import IntroSplash from "@/components/IntroSplash";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Central Cobertura de Provas | Medway",
  description:
    "Hub de conteúdos da Cobertura de Provas Medway: ultra revisões, previsões Medbrain e lives de correção para a sua prova de residência.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <IntroSplash />
        {children}
      </body>
    </html>
  );
}
