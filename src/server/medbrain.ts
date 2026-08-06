import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Lê um PDF de previsões do MedBrain e extrai, com a IA (Google Gemini), a
 * prova (edição, na capa) e a lista de previsões numeradas, agrupadas por
 * especialidade. O Gemini lê o PDF de forma visual (vê as páginas
 * renderizadas), então o layout de 2 colunas — que quebra a extração de texto
 * tradicional — não é problema.
 */

const MODELO = "gemini-2.5-flash";

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

/**
 * Schema no subconjunto aceito pelo Gemini (OpenAPI). Não use
 * `additionalProperties` — o Gemini não suporta.
 */
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    edicao: {
      type: Type.STRING,
      description: "A edição/prova identificada na capa (ex.: 'HIAE', 'USP-SP').",
    },
    provaNome: {
      type: Type.STRING,
      description: "Nome sugerido para a prova (ex.: 'Edição HIAE').",
    },
    previsoes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          especialidade: {
            type: Type.STRING,
            description:
              "A grande área/especialidade sob a qual a previsão aparece (ex.: 'Clínica Médica', 'Cirurgia Geral', 'Ginecologia e Obstetrícia', 'Pediatria', 'Preventiva').",
          },
          titulo: {
            type: Type.STRING,
            description:
              "O tema/assunto da previsão, curto e objetivo (ex.: 'Fibrilação Atrial', 'Tratamento do DM2').",
          },
          descricao: {
            type: Type.STRING,
            description:
              "Resumo curto (1-2 frases) do que o material diz sobre o tema. Use string vazia se não houver.",
          },
        },
        required: ["especialidade", "titulo", "descricao"],
        propertyOrdering: ["especialidade", "titulo", "descricao"],
      },
    },
  },
  required: ["edicao", "provaNome", "previsoes"],
  propertyOrdering: ["edicao", "provaNome", "previsoes"],
};

const PROMPT = `Você recebeu um PDF de "Previsões do MedBrain" — um material que lista os temas com maior chance de cair em uma prova de residência médica.

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada no .env — pegue a chave grátis em aistudio.google.com."
    );
  }

  // Baixa o PDF do Storage e converte para base64 (o corpo do server action
  // tem limite ~4,5MB na Vercel; por isso o PDF vem do Storage por URL).
  const resp = await fetch(pdfUrl);
  if (!resp.ok) {
    throw new Error(`Não consegui baixar o PDF do Storage (HTTP ${resp.status}).`);
  }
  const base64 = Buffer.from(await resp.arrayBuffer()).toString("base64");

  const ai = new GoogleGenAI({ apiKey });

  let texto: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: MODELO,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "application/pdf", data: base64 } },
            { text: PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA,
        // Desliga o "thinking" para dar todo o orçamento à resposta e ir mais rápido.
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 8192,
        temperature: 0,
      },
    });
    texto = response.text;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Falha ao chamar a IA (Gemini): ${msg.slice(0, 200)}`);
  }

  if (!texto || !texto.trim()) {
    throw new Error("A IA não retornou dados (possível bloqueio ou PDF ilegível).");
  }

  let dados: ExtracaoMedbrain;
  try {
    dados = JSON.parse(texto) as ExtracaoMedbrain;
  } catch {
    throw new Error("Não consegui interpretar a resposta da IA.");
  }
  if (!Array.isArray(dados.previsoes) || dados.previsoes.length === 0) {
    throw new Error("A IA não encontrou previsões neste PDF.");
  }

  // Normaliza/limpa
  const previsoes = dados.previsoes
    .map((p) => ({
      especialidade: (p.especialidade ?? "").trim(),
      titulo: (p.titulo ?? "").trim(),
      descricao: (p.descricao ?? "").trim(),
    }))
    .filter((p) => p.titulo.length > 0);

  const edicao = (dados.edicao ?? "").trim();
  return {
    edicao,
    provaNome: (dados.provaNome ?? "").trim() || edicao || "Previsões MedBrain",
    previsoes,
  };
}
