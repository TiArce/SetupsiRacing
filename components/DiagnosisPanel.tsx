"use client";

import { classifyFeedback, diagnose, gradualRecommendation } from "@/lib/recommendationEngine";
import { Setup } from "@/lib/types";
import { useMemo, useState } from "react";

const levels = ["leve", "moderado", "agressivo", "extremo"] as const;

export function DiagnosisPanel({ setup }: { setup?: Setup }) {
  const [feedback, setFeedback] = useState("carro sai de frente na saída da curva e piora depois de 15 voltas");
  const parsed = useMemo(() => classifyFeedback(feedback), [feedback]);
  const recs = useMemo(() => diagnose(feedback), [feedback]);

  return (
    <section className="card">
      <h2>3 + 9 + 10) Diagnóstico por feedback e recomendações graduais</h2>
      <textarea className="textarea" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <p><strong>Fases detectadas:</strong> {parsed.phase.join(", ")} · <strong>Foco:</strong> {parsed.foco}</p>
      {recs.length === 0 ? <p className="muted">Sem regra direta encontrada. Use termos como “push na saída”, “loose na entrada”.</p> : recs.map((rec) => (
        <article key={rec.symptom} className="subcard">
          <h3>{rec.symptom} ({rec.phase})</h3>
          {rec.steps.slice(0, 2).map((step) => (
            <div key={step.parameter} className="levelGrid">
              <strong>{step.parameter}</strong>
              {levels.map((lvl) => {
                const current = setup?.inputs[step.parameter] ?? 0;
                const g = gradualRecommendation(step, current, lvl);
                return (
                  <div key={lvl} className={`lvl ${lvl}`}>
                    <h4>{lvl}</h4>
                    <p>Atual: {g.atual}</p><p>Sugerido: {g.sugerido}</p><p>Efeito: {g.efeito}</p><p>Risco: {g.risco}</p><p>Parar quando: {g.pararQuando}</p>
                  </div>
                );
              })}
            </div>
          ))}
          <p className="muted">Iteração limitada a no máximo 2 ajustes grandes por teste.</p>
        </article>
      ))}
    </section>
  );
}
