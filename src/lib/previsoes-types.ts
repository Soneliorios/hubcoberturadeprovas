// Tipos de domínio da feature de Previsões (votação estilo "apostas").

export type ProvaStatus = "votacao" | "encerrada" | "resultado";

export function rotuloStatus(s: string): { label: string; classe: string } {
  switch (s) {
    case "resultado":
      return { label: "Resultado saiu", classe: "bg-teal/15 text-teal" };
    case "encerrada":
      return { label: "Votação encerrada", classe: "bg-warning/15 text-warning" };
    default:
      return { label: "Votação aberta", classe: "bg-blue/20 text-blue" };
  }
}

/** Uma previsão (tema) já com os agregados de votação para o usuário atual. */
export interface PrevisaoPublica {
  id: string;
  titulo: string;
  descricao?: string;
  especialidade?: string;
  /** null = ainda sem resultado; true = caiu; false = não caiu */
  caiu: boolean | null;
  votosSim: number;
  votosTotal: number;
  /** % que acha que vai cair (0–100) */
  pctSim: number;
  /** voto do usuário atual: true/false/null (não votou) */
  meuVoto: boolean | null;
  /** no status "resultado": o usuário acertou? (null se não votou) */
  acertei: boolean | null;
}

export interface ProvaResumo {
  id: string;
  nome: string;
  estado?: string;
  nivel?: string;
  status: ProvaStatus;
  dataProva?: string;
  totalPrevisoes: number;
  participantes: number;
}

export interface Placar {
  acertos: number;
  resolvidas: number; // previsões com resultado (caiu) definido
  votadas: number; // dessas resolvidas, quantas o usuário votou
  /** total de votos do usuário nesta prova (independe de ter resultado) */
  votouNaProva: number;
}

/** Pluralização simples pt-BR: plural(1,"previsão","previsões") → "1 previsão". */
export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export interface ProvaDetalhe extends ProvaResumo {
  previsoes: PrevisaoPublica[];
  /** placar do usuário (só faz sentido no status "resultado") */
  placar: Placar;
  /** o visitante está cadastrado? (define se pode votar) */
  podeVotar: boolean;
}
