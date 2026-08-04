"use client";

import type { Nivel, UF } from "@/lib/types";
import { ESTADOS } from "@/data/estados";
import Dropdown, { type DropdownOption } from "./Dropdown";

const OPCOES_NIVEL: DropdownOption<Nivel>[] = [
  { value: null, label: "Todos os conteúdos" },
  { value: "R1", label: "Acesso Direto", hint: "R1" },
  { value: "R+", label: "Especialidade", hint: "R+" },
];

const OPCOES_ESTADO: DropdownOption<UF>[] = [
  { value: null, label: "Todos os estados" },
  ...ESTADOS.map((e) => ({ value: e.uf, label: e.nome, hint: e.uf })),
];

/** Barra de filtros da home: nível (R1/R+) + estado (UF). */
export default function Filtros({
  nivel,
  uf,
  onNivel,
  onUf,
}: {
  nivel: Nivel | null;
  uf: UF | null;
  onNivel: (n: Nivel | null) => void;
  onUf: (u: UF | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:max-w-2xl">
      <Dropdown
        label="Tipo de prova"
        value={nivel}
        options={OPCOES_NIVEL}
        onChange={onNivel}
      />
      <Dropdown
        label="Estado"
        value={uf}
        options={OPCOES_ESTADO}
        onChange={onUf}
      />
    </div>
  );
}
