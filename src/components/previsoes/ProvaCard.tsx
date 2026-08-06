import Link from "next/link";
import type { ProvaResumo } from "@/lib/previsoes-types";
import { rotuloStatus, plural } from "@/lib/previsoes-types";
import ContagemRegressiva from "./ContagemRegressiva";

export default function ProvaCard({ prova }: { prova: ProvaResumo }) {
  const status = rotuloStatus(prova.status);
  return (
    <Link
      href={`/previsoes/${prova.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-teal/60 hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status.classe}`}>
          {status.label}
        </span>
        {prova.nivel && (
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
            {prova.nivel === "R+" ? "Especialidade" : "Acesso Direto"}
          </span>
        )}
        {prova.estado && (
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
            {prova.estado}
          </span>
        )}
        {prova.status === "votacao" && prova.dataProva && (
          <ContagemRegressiva dataISO={prova.dataProva} />
        )}
      </div>

      <h3 className="text-lg font-bold leading-tight">{prova.nome}</h3>

      <div className="mt-auto flex items-center gap-4 text-sm text-muted">
        <span>🔮 {plural(prova.totalPrevisoes, "previsão", "previsões")}</span>
        <span>
          👥 {prova.participantes}{" "}
          {prova.status === "votacao" ? "votando" : "participaram"}
        </span>
        <span className="ml-auto font-semibold text-teal group-hover:underline">
          {prova.status === "resultado" ? "Ver placar" : "Palpitar"} →
        </span>
      </div>
    </Link>
  );
}
