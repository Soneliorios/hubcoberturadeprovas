"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  camposVisiveis,
  validarRespostas,
  type CampoHs,
  type FormularioHs,
  type ValoresHs,
} from "@/lib/hubspot-form";
import {
  cadastrarHubspotAction,
  type HsFormState,
} from "@/app/cadastro/actions";

const inicial: HsFormState = { ok: false };

function formatarTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Formulário de cadastro renderizado a partir da definição HubSpot:
 * mesmos campos, obrigatórios e lógicas condicionais configurados lá,
 * com o visual do app. Envio duplo: nossa base + HubSpot Forms API.
 */
export default function CadastroHubspotForm({
  form,
  voltar,
}: {
  form: FormularioHs;
  voltar?: string;
}) {
  const [state, formAction, pending] = useActionState(
    cadastrarHubspotAction,
    inicial
  );
  const [valores, setValores] = useState<ValoresHs>({});
  const [errosLocais, setErrosLocais] = useState<Record<string, string>>({});
  const erros = { ...(state.erros ?? {}), ...errosLocais };

  const visiveis = useMemo(
    () => camposVisiveis(form, valores),
    [form, valores]
  );

  // URL real da página (para o hs_url/hs_url_domain da HubSpot) + utm_*.
  // Capturado após a hidratação (useEffect), portanto disponível bem antes
  // de o usuário conseguir enviar. Se por algum motivo não vier, o servidor
  // aplica um fallback seguro (ver actions.ts).
  const [extras, setExtras] = useState("{}");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {
      pageUrl: window.location.href, // URL COMPLETA onde o form foi enviado
      pageName: document.title,
    };
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const v = p.get(k);
      if (v) out[k] = v;
    }
    setExtras(JSON.stringify(out));
  }, []);

  function definir(name: string, v: string | string[]) {
    setValores((prev) => ({ ...prev, [name]: v }));
    setErrosLocais((prev) => {
      if (!prev[name]) return prev;
      const { [name]: _removido, ...resto } = prev;
      return resto;
    });
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    // validação local antes do roundtrip (o servidor revalida tudo)
    const errosAgora = validarRespostas(form, valores);
    if (Object.keys(errosAgora).length > 0) {
      e.preventDefault();
      setErrosLocais(errosAgora);
      const primeiro = document.querySelector<HTMLElement>("[data-erro='1']");
      primeiro?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <form action={formAction} onSubmit={aoSubmeter} className="space-y-5" noValidate>
      {/* Honeypot anti-bot */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {voltar && <input type="hidden" name="voltar" value={voltar} />}
      <input type="hidden" name="payload" value={JSON.stringify(valores)} />
      <input type="hidden" name="extras" value={extras} />

      {form.linhas.map((linha, i) => {
        const daLinha = linha.filter((c) => visiveis.has(c.name));
        if (daLinha.length === 0) return null;
        return (
          <div
            key={i}
            className={
              daLinha.length > 1 ? "grid grid-cols-1 gap-5 sm:grid-cols-2" : ""
            }
          >
            {daLinha.map((campo) => (
              <Campo
                key={campo.name}
                campo={campo}
                valor={valores[campo.name]}
                erro={erros[campo.name]}
                onChange={(v) => definir(campo.name, v)}
              />
            ))}
          </div>
        );
      })}

      {erros.form && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {erros.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal px-4 py-3 text-base font-bold text-black transition-colors hover:bg-teal-strong disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Desbloquear conteúdos"}
      </button>

      <p className="text-center text-xs text-muted">
        Ao continuar, você concorda em receber comunicações da Medway sobre a
        Cobertura de Provas.
      </p>
    </form>
  );
}

function Campo({
  campo,
  valor,
  erro,
  onChange,
}: {
  campo: CampoHs;
  valor: string | string[] | undefined;
  erro?: string;
  onChange: (v: string | string[]) => void;
}) {
  const id = `hs-${campo.name}`;
  const errId = `${id}-erro`;
  const aria = {
    "aria-invalid": !!erro || undefined,
    "aria-describedby": erro ? errId : undefined,
  };

  return (
    <div data-erro={erro ? "1" : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {campo.label}
        {campo.required && <span className="text-teal"> *</span>}
      </label>
      {campo.description && (
        <p className="-mt-1 mb-1.5 text-xs text-muted">{campo.description}</p>
      )}

      {campo.tipo === "dropdownSelect" ? (
        <select
          id={id}
          value={String(valor ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="input"
          {...aria}
        >
          <option value="">Selecione…</option>
          {campo.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : campo.tipo === "multipleCheckbox" ? (
        <div className="no-scrollbar flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-surface p-3">
          {campo.options.map((o) => {
            const lista = Array.isArray(valor) ? valor : [];
            const marcado = lista.includes(o.value);
            return (
              <label key={o.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() =>
                    onChange(
                      marcado
                        ? lista.filter((x) => x !== o.value)
                        : [...lista, o.value]
                    )
                  }
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-teal/50 hover:text-foreground peer-checked:border-teal peer-checked:bg-teal peer-checked:text-black">
                  {o.label}
                </span>
              </label>
            );
          })}
        </div>
      ) : campo.tipo === "phoneNumber" ? (
        <input
          id={id}
          type="tel"
          value={String(valor ?? "")}
          onChange={(e) => onChange(formatarTelefone(e.target.value))}
          placeholder={campo.placeholder || "(11) 99999-9999"}
          className="input"
          autoComplete="tel"
          maxLength={20}
          {...aria}
        />
      ) : (
        <input
          id={id}
          type={campo.tipo === "email" ? "email" : "text"}
          value={String(valor ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || undefined}
          className="input"
          autoComplete={
            campo.name === "email"
              ? "email"
              : campo.name === "firstname"
                ? "given-name"
                : campo.name === "lastname"
                  ? "family-name"
                  : undefined
          }
          maxLength={254}
          {...aria}
        />
      )}

      {erro && (
        <p id={errId} className="mt-1 text-xs text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
