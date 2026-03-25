"use client";

import { ADJUSTMENT_RULES } from "@/lib/seed";
import { useState } from "react";

export function DecisionMatrix() {
  const [phase, setPhase] = useState("todos");
  const filtered = phase === "todos" ? ADJUSTMENT_RULES : ADJUSTMENT_RULES.filter((r) => r.phase === phase);

  return (
    <section className="card">
      <h2>4) Matriz de decisões (reação → ação → consequência → limite → próximo passo)</h2>
      <select className="input" value={phase} onChange={(e) => setPhase(e.target.value)}>
        <option value="todos">Todas as fases</option>
        <option value="entrada">Entrada</option>
        <option value="meio">Meio</option>
        <option value="saida">Saída</option>
      </select>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Reação</th><th>Ação</th><th>Consequência</th><th>Limite</th><th>Próximo passo</th></tr></thead>
          <tbody>
            {filtered.map((r) => <tr key={r.reaction}><td>{r.reaction}</td><td>{r.action}</td><td>{r.consequence}</td><td>{r.limit}</td><td>{r.nextStep}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
