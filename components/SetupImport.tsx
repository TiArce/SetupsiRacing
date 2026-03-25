"use client";

import { parseSetupText } from "@/lib/parser";
import { Setup } from "@/lib/types";
import { useState } from "react";

const EXAMPLE = `Tires
LF PSI: 27.5
RF PSI: 49.0
LR PSI: 21.5
RR PSI: 22.5

Diferencial
Diff Preload: 27 Nm

Amortecedores Traseiros
RR LS Rebound: 6
RR LS Compression: 5

Barras
Rear ARB Preload: 120

Alinhamento
LR Toe: 0.08
RF Camber: -3.6
Brake Bias: 53.8`;

export function SetupImport({ onParsed }: { onParsed: (setup: Setup) => void }) {
  const [raw, setRaw] = useState(EXAMPLE);
  const [name, setName] = useState("Setup colado");

  return (
    <section className="card">
      <h2>1) Importação e leitura de setup</h2>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da versão" />
      <textarea className="textarea" value={raw} onChange={(e) => setRaw(e.target.value)} rows={13} />
      <button className="button" onClick={() => onParsed(parseSetupText(raw, name))}>Interpretar setup</button>
      <p className="muted">Parser tolerante a seções e separadores (:, tab e =). Suporta Kapps copiado com pequenas variações.</p>
    </section>
  );
}
