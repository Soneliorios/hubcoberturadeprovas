import "server-only";
import type {
  CampoHs,
  FiltroHs,
  FormularioHs,
  RegraHs,
  TipoCampoHs,
  ValoresHs,
} from "@/lib/hubspot-form";

function portalId(): string {
  const v = process.env.HUBSPOT_PORTAL_ID;
  if (!v) throw new Error("HUBSPOT_PORTAL_ID não configurado no .env");
  return v;
}

function formId(): string {
  const v = process.env.HUBSPOT_FORM_ID;
  if (!v) throw new Error("HUBSPOT_FORM_ID não configurado no .env");
  return v;
}

const TIPOS: Record<string, TipoCampoHs> = {
  text: "text",
  email: "email",
  phoneNumber: "phoneNumber",
  dropdownSelect: "dropdownSelect",
  multipleCheckbox: "multipleCheckbox",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

function parseFiltro(f: any): FiltroHs {
  if (f?.type === "filter") {
    return {
      type: "filter",
      propertyReference: String(f.propertyReference ?? ""),
      operator: String(f.operation?.operator ?? ""),
      values: (f.operation?.values ?? []).map(String),
    };
  }
  return {
    type: "group",
    branchType: f?.branchType === "and" ? "and" : "or",
    filters: (f?.filters ?? []).map(parseFiltro),
  };
}

/** Extrai as linhas de campos da árvore de módulos do embed V4. */
function parseLinhas(modules: any[]): CampoHs[][] {
  const linhas: CampoHs[][] = [];

  function campoDe(m: any): CampoHs | null {
    const tipo = TIPOS[String(m?.type ?? "")];
    if (!tipo || !m?.propertyReference) return null;
    const [objectTypeId, name] = String(m.propertyReference).split("/");
    return {
      id: String(m.id),
      name: name ?? String(m.propertyReference),
      objectTypeId: objectTypeId ?? "0-1",
      label: String(m.label ?? name),
      placeholder: m.placeholder ? String(m.placeholder) : undefined,
      description: m.description ? String(m.description) : undefined,
      tipo,
      required: !!m.required,
      condicional: !!m.conditionallyHidden,
      controllingRuleIds: (m.controllingRuleIds ?? []).map(String),
      options: (m.options ?? []).map((o: any) => ({
        label: String(o.label ?? o.value),
        value: String(o.value ?? o.label),
      })),
    };
  }

  function anda(mods: any[]) {
    for (const m of mods ?? []) {
      const filhos: any[] = m?.modules ?? [];
      const campos = filhos.map(campoDe).filter(Boolean) as CampoHs[];
      if (campos.length > 0) {
        linhas.push(campos);
      } else if (filhos.length > 0) {
        anda(filhos);
      }
    }
  }
  anda(modules);
  return linhas;
}

/**
 * Definição do formulário (endpoint público usado pelo próprio embed),
 * com cache de 5 min — mudanças feitas na HubSpot aparecem sozinhas.
 */
export async function getFormularioHubspot(): Promise<FormularioHs> {
  const res = await fetch(
    `https://forms-na1.hsforms.com/embed/v4/render-definition/${portalId()}/${formId()}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) {
    throw new Error(`Falha ao carregar formulário HubSpot (${res.status})`);
  }
  const dados = await res.json();
  const form = dados?.form;
  if (!form?.modules) {
    throw new Error("Definição do formulário HubSpot vazia/inesperada.");
  }

  const regras: Record<string, RegraHs> = {};
  for (const [id, r] of Object.entries<any>(form.logicRules ?? {})) {
    regras[id] = {
      id,
      acao: String(r?.action?.type ?? "showElement"),
      filtro: parseFiltro(r?.filter ?? {}),
    };
  }

  return {
    portalId: portalId(),
    formId: formId(),
    linhas: parseLinhas(form.modules),
    regras,
  };
}

export interface ContextoHs {
  /** cookie hubspotutk (rastreamento) — associa a submissão à navegação */
  hutk?: string;
  pageUri?: string;
  pageName?: string;
}

/**
 * Envia a submissão à HubSpot pelo endpoint público de formulário (legado v2).
 * Diferente do endpoint de "integração", este RESPEITA a lógica condicional:
 * aceita apenas os campos visíveis/enviados (sem exigir os condicionais
 * ocultos) e registra uma submissão de formulário de verdade — disparando
 * réguas, listas e atribuição de origem. Nenhum token é necessário.
 *
 * `respostas` já deve conter apenas campos visíveis/validados.
 */
export async function enviarParaHubspot(
  form: FormularioHs,
  respostas: ValoresHs,
  contexto: ContextoHs
): Promise<void> {
  const body = new URLSearchParams();
  for (const [name, v] of Object.entries(respostas)) {
    body.set(name, Array.isArray(v) ? v.join(";") : String(v));
  }
  body.set(
    "hs_context",
    JSON.stringify({
      hutk: contexto.hutk,
      pageUri: contexto.pageUri,
      pageName: contexto.pageName,
    })
  );

  const res = await fetch(
    `https://forms.hubspot.com/uploads/form/v2/${form.portalId}/${form.formId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body.toString(),
      redirect: "manual", // sucesso responde 302 para a página de obrigado
    }
  );

  // 200/204 (inline) ou 302 (redirect) = sucesso; 4xx = erro de validação.
  if (res.status >= 400) {
    const corpo = await res.text();
    throw new Error(
      `HubSpot recusou a submissão (${res.status}): ${corpo.slice(0, 300)}`
    );
  }
}
