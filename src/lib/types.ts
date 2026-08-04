// Tipos de domínio da Central Cobertura de Provas

/** Tipo de destino ao clicar em um card de conteúdo */
export type ContentType = "youtube" | "arquivo";

/** Nível da residência ao qual o conteúdo se destina */
export type Nivel = "R1" | "R+";

/** Sigla dos estados brasileiros (UF) usada no filtro */
export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO"
  | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI"
  | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

/** Um item de conteúdo (um vídeo do YouTube ou um arquivo para download) */
export interface ContentItem {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: ContentType;
  /** URL do vídeo no YouTube ou do arquivo para download */
  url: string;
  /** Imagem de capa (thumbnail). Opcional — há fallback visual. */
  thumbnail?: string;
  /** Instituição/prova relacionada (ex.: "USP-SP", "ENARE") */
  prova?: string;
  /** Estados aos quais o conteúdo se aplica. Vazio/ausente = nacional. */
  estados?: UF[];
  /** Data de publicação em ISO (usada para ordenação e "novo") */
  publicadoEm?: string;
  /** Duração aproximada em minutos (vídeos) */
  duracaoMin?: number;
}

/** Um bloco/categoria da home (renderiza um carrossel) */
export interface ContentBlock {
  id: string;
  titulo: string;
  nivel: Nivel;
  /** Emoji ou nome de ícone opcional exibido ao lado do título */
  icone?: string;
  /** Tipo predominante de conteúdo do bloco (define o rótulo do card) */
  tipoPadrao: ContentType;
  itens: ContentItem[];
}

/** Nível de acesso de uma seção */
export type Acesso = "aberto" | "cadastro";

/** Metadados de uma seção (gerenciada pelo admin, vive no banco) */
export interface SecaoInfo {
  id: string;
  titulo: string;
  icone?: string;
  nivel: Nivel;
  tipoPadrao: ContentType;
  acesso: Acesso;
  ordem: number;
}

/**
 * Seção pronta para a home. `itens` traz APENAS os conteúdos acessíveis ao
 * visitante — os restritos nunca chegam ao navegador (nem o título):
 * - `bloqueada` = tudo restrito → vitrine-mistério borrada;
 * - `bloqueados` > 0 com itens abertos → abertos primeiro + bloco borrado
 *   no fim do carrossel com CTA de cadastro.
 */
export interface SecaoComConteudos {
  secao: SecaoInfo;
  bloqueada: boolean;
  itens: ContentItem[];
  /** Quantos conteúdos da seção estão restritos para este visitante */
  bloqueados: number;
  total: number;
}

/** Notificação exibida no sino do header */
export interface Notificacao {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // ISO
  lida?: boolean;
}
