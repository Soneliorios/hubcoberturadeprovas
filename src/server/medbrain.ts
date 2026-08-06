import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Lê um PDF de previsões do MedBrain e extrai, com a IA (Claude), a prova
 * (edição, na capa) e a lista de previsões numeradas, agrupadas por
 * especialidade. Claude lê o PDF de forma visual, então o layout de 2 colunas
 * (que quebra a extração de texto tradicional) não é problema.
 */

const MODELO = "claude-opus-5";

export interface PrevisaoExtraida {
  especialidade: string;
  titulo: string;
  descricao: string;
}

export interface ExtracaoMedbrain {
  /** Edição na capa, ex.: "HIAE", "USP-SP 2026". */
  edicao: string;
  /** Nome sugerido para a prova, ex.: "Edição HIAE". */
  provaNome: string;
  previsoes: PrevisaoExtraida[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    edicao: {
      type: "string",
      description: "A edição/prova identificada na capa (ex.: 'HIAE', 'USP-SP').",
    },
    provaNome: {
      type: "string",
      description: "Nome sugerido para a prova (ex.: 'Edição HIAE').",
    },
    previsoes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          especialidade: {
            type: "string",
            description:
              "A grande área/especialidade sob a qual a previsão aparece (ex.: 'Clínica Médica', 'Cirurgia Geral', 'Ginecologia e Obstetrícia', 'Pediatria', 'Preventiva').",
          },
          titulo: {
            type: "string",
            description:
              "O tema/assunto da previsão, curto e objetivo (ex.: 'Fibrilação Atrial', 'Tratamento do DM2').",
          },
          descricao: {
            type: "string",
            description:
              "Resumo curto (1-2 frases) do que o material diz sobre por que o tema pode cair. Use string vazia se não houver.",
          },
        },
        required: ["especialidade", "titulo", "descricao"],
      },
    },
  },
  required: ["edicao", "provaNome", "previsoes"],
} as const;

const PROMPT = `Você recebeu um PDF de "Previsões do MedBrain" — um material que lista os temas que têm maior chance de cair em uma prova de residência médica.

Sua tarefa: extrair, em JSON, a prova e a lista de previsões.

1. PROVA (capa): a primeira página traz a edição/prova, geralmente como "Edição XXX". Preencha "edicao" com esse identificador (ex.: "HIAE") e "provaNome" com um nome legível (ex.: "Edição HIAE").

2. PREVISÕES: percorra o material e extraia CADA previsão numerada (marcada como "Previsão #N" ou equivalente). Para cada uma:
   - "especialidade": a grande área sob a qual ela aparece (Clínica Médica, Cirurgia Geral, Ginecologia e Obstetrícia, Pediatria, Preventiva etc.).
   - "titulo": o tema/assunto da previsão, curto e direto.
   - "descricao": um resumo de 1-2 frases do texto explicativo; string vazia se não houver.

Regras importantes:
- O layout costuma ter 2 colunas — leia na ordem de leitura correta (coluna esquerda inteira, depois a direita, ou conforme o desenho da página).
- IGNORE páginas introdutórias (exercício de respiração, "Quem é o MedBrain", sumário) e caixas que NÃO são previsões numeradas, como "De olho na imagem", "Não caia na pegadinha", "Indicações Cirúrgicas", "Hot topics" e afins.
- Mantenha a ordem em que as previsões aparecem no material.
- Não invente previsões: extraia apenas o que está no PDF.`;

export async function extrairPrevisoesDoPdf(
  pdfUrl: string
): Promise<ExtracaoMedbrain> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada no .env — peça a chave e adicione ao ambiente."
    );
  }

  // Baixa o PDF do Storage e converte para base64 (o corpo do server action
  // tem limite ~4,5MB na Vercel; por isso o PDF já vem do Storage por URL).
  const resp = await fetch(pdfUrl);
  if (!resp.ok) {
    throw new Error(`Não consegui baixar o PDF do Storage (HTTP ${resp.status}).`);
  }
  const base64 = Buffer.from(await resp.arrayBuffer()).toString("base64");

  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: MODELO,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("A IA recusou processar este arquivo.");
  }

  const texto = message.content.find((b) => b.type === "text");
  if (!texto || texto.type !== "text") {
    throw new Error("A IA não retornou os dados esperados.");
  }

  let dados: ExtracaoMedbrain;
  try {
    dados = JSON.parse(texto.text) as ExtracaoMedbrain;
  } catch {
    throw new Error("Não consegui interpretar a resposta da IA.");
  }
  if (!Array.isArray(dados.previsoes) || dados.previsoes.length === 0) {
    throw new Error("A IA não encontrou previsões neste PDF.");
  }

  // Normaliza/limpa
  dados.previsoes = dados.previsoes
    .map((p) => ({
      especialidade: (p.especialidade ?? "").trim(),
      titulo: (p.titulo ?? "").trim(),
      descricao: (p.descricao ?? "").trim(),
    }))
    .filter((p) => p.titulo.length > 0);

  return {
    edicao: (dados.edicao ?? "").trim(),
    provaNome: (dados.provaNome ?? "").trim() || (dados.edicao ?? "").trim() || "Previsões MedBrain",
    previsoes: dados.previsoes,
  };
}
