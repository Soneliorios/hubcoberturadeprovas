/**
 * Tipos e motor de lógica condicional do formulário HubSpot (embed V4).
 * Isomórfico: roda no cliente (mostrar/ocultar em tempo real) e no servidor
 * (revalidação de segurança antes de gravar/enviar).
 */

export type TipoCampoHs =
  | "text"
  | "email"
  | "phoneNumber"
  | "dropdownSelect"
  | "multipleCheckbox";

export interface OpcaoHs {
  label: string;
  value: string;
}

export interface CampoHs {
  /** id do módulo no formulário (usado pelas regras) */
  id: string;
  /** nome da propriedade no CRM (ex.: "email", "firstname") */
  name: string;
  /** ex.: "0-1" = contato */
  objectTypeId: string;
  label: string;
  placeholder?: string;
  description?: string;
  tipo: TipoCampoHs;
  required: boolean;
  /** começa oculto; aparece quando alguma regra controladora casar */
  condicional: boolean;
  controllingRuleIds: string[];
  options: OpcaoHs[];
}

/** Filtro das regras (árvore and/or com folhas de comparação) */
export interface FiltroHs {
  type: "group" | "filter";
  branchType?: "and" | "or";
  filters?: FiltroHs[];
  /** nas folhas: */
  propertyReference?: string; // "0-1/nome_do_campo"
  operator?: string; // isAnyOf | isNoneOf | hasAValue
  values?: string[];
}

export interface RegraHs {
  id: string;
  acao: string; // showElement
  filtro: FiltroHs;
}

export interface FormularioHs {
  portalId: string;
  formId: string;
  /** linhas do formulário (uma linha pode ter 2 campos lado a lado) */
  linhas: CampoHs[][];
  regras: Record<string, RegraHs>;
}

export type ValoresHs = Record<string, string | string[]>;

function valorDe(valores: ValoresHs, propertyReference: string): string[] {
  const nome = propertyReference.split("/").pop() ?? propertyReference;
  const v = valores[nome];
  if (v == null) return [];
  const lista = Array.isArray(v) ? v : [v];
  return lista.filter((s) => s !== "");
}

function avaliarFiltro(f: FiltroHs, valores: ValoresHs): boolean {
  if (f.type === "group") {
    const subs = f.filters ?? [];
    if (subs.length === 0) return false;
    return f.branchType === "and"
      ? subs.every((s) => avaliarFiltro(s, valores))
      : subs.some((s) => avaliarFiltro(s, valores));
  }
  // folha
  const atuais = valorDe(valores, f.propertyReference ?? "");
  switch (f.operator) {
    case "isAnyOf":
      return atuais.some((v) => (f.values ?? []).includes(v));
    case "isNoneOf":
      return atuais.length > 0 && !atuais.some((v) => (f.values ?? []).includes(v));
    case "hasAValue":
      return atuais.length > 0;
    default:
      // operador desconhecido: falha fechado (campo não aparece)
      return false;
  }
}

/** Nomes dos campos visíveis dado o estado atual das respostas. */
export function camposVisiveis(form: FormularioHs, valores: ValoresHs): Set<string> {
  const visiveis = new Set<string>();
  for (const linha of form.linhas) {
    for (const campo of linha) {
      if (!campo.condicional) {
        visiveis.add(campo.name);
        continue;
      }
      // showElement: aparece se QUALQUER regra controladora casar
      const aparece = campo.controllingRuleIds.some((rid) => {
        const r = form.regras[rid];
        return r ? avaliarFiltro(r.filtro, valores) : false;
      });
      if (aparece) visiveis.add(campo.name);
    }
  }
  return visiveis;
}

/** Valida obrigatórios entre os campos visíveis. Retorna { campo: mensagem }. */
export function validarRespostas(
  form: FormularioHs,
  valores: ValoresHs
): Record<string, string> {
  const visiveis = camposVisiveis(form, valores);
  const erros: Record<string, string> = {};
  for (const linha of form.linhas) {
    for (const campo of linha) {
      if (!visiveis.has(campo.name)) continue;
      const v = valores[campo.name];
      const vazio = v == null || v === "" || (Array.isArray(v) && v.length === 0);
      if (campo.required && vazio) {
        erros[campo.name] = "Campo obrigatório.";
        continue;
      }
      if (vazio) continue;
      const texto = Array.isArray(v) ? v.join(";") : v;
      if (texto.length > 500) {
        erros[campo.name] = "Valor muito longo.";
        continue;
      }
      if (campo.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) {
        erros[campo.name] = "Informe um e-mail válido.";
      }
      if (campo.tipo === "phoneNumber" && String(v).replace(/\D/g, "").length < 10) {
        erros[campo.name] = "Informe um telefone com DDD.";
      }
      // dropdown/checkbox: valor precisa existir nas opções
      if (
        (campo.tipo === "dropdownSelect" || campo.tipo === "multipleCheckbox") &&
        campo.options.length > 0
      ) {
        const validos = new Set(campo.options.map((o) => o.value));
        const lista = Array.isArray(v) ? v : [v];
        if (!lista.every((x) => validos.has(String(x)))) {
          erros[campo.name] = "Opção inválida.";
        }
      }
    }
  }
  return erros;
}

/** Só as respostas de campos visíveis (campos ocultos não são enviados). */
export function respostasVisiveis(
  form: FormularioHs,
  valores: ValoresHs
): ValoresHs {
  const visiveis = camposVisiveis(form, valores);
  const out: ValoresHs = {};
  for (const linha of form.linhas) {
    for (const campo of linha) {
      if (!visiveis.has(campo.name)) continue;
      const v = valores[campo.name];
      const vazio = v == null || v === "" || (Array.isArray(v) && v.length === 0);
      if (!vazio) out[campo.name] = v;
    }
  }
  return out;
}
