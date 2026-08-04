import { redirect } from "next/navigation";

export default function Home() {
  // Entrada pública: o hub é aberto; o cadastro é oferecido nas seções bloqueadas.
  redirect("/conteudos");
}
