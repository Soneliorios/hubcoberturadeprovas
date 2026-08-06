"use client";

import { useEffect, useState } from "react";

/** Contagem regressiva até a data da prova (client, atualiza a cada minuto). */
export default function ContagemRegressiva({ dataISO }: { dataISO: string }) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    const alvo = new Date(dataISO).getTime();
    function tick() {
      const diff = alvo - Date.now();
      if (diff <= 0) {
        setTexto("é hoje!");
        return;
      }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      if (dias > 0) setTexto(`faltam ${dias} dia${dias === 1 ? "" : "s"}`);
      else if (horas > 0) setTexto(`faltam ${horas}h`);
      else setTexto("falta menos de 1h");
    }
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [dataISO]);

  if (!texto) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold text-warning">
      ⏳ {texto}
    </span>
  );
}
