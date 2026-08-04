import { redirect } from "next/navigation";

export default function Home() {
  // Fluxo de entrada: cadastro do lead → conteúdos.
  redirect("/cadastro");
}
