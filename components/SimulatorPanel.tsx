"use client";

import { Setup } from "@/lib/types";

export function SimulatorPanel({ setup }: { setup?: Setup }) {
  if (!setup) return null;
  const preload = setup.inputs.diffPreloadNm ?? 27;
  const rrReb = setup.inputs.rrLsRebound ?? 6;
  const trendRotation = Math.max(0, 10 - preload / 4 + rrReb / 2).toFixed(1);
  const trendStability = Math.max(0, preload / 4 + (setup.inputs.rrLsCompression ?? 5)).toFixed(1);

  return (
    <section className="card">
      <h2>2) Simulador conceitual de ajustes</h2>
      <div className="simGrid">
        <div><span>Rotação na saída</span><meter min={0} max={10} value={Number(trendRotation)} /></div>
        <div><span>Estabilidade no throttle</span><meter min={0} max={10} value={Number(trendStability)} /></div>
        <div><span>Risco wheelspin</span><meter min={0} max={10} value={Math.max(0, 10 - Number(trendStability))} /></div>
      </div>
      <p>Regra aplicada: reduzir <strong>Diff Preload</strong> aumenta rotação e risco de instabilidade; aumentar <strong>RR LS Rebound</strong> sustenta carga no RR e melhora tração de saída.</p>
      <p className="muted">Inputs ajustáveis: diferencial, dampers, barra traseira, toe, camber. Outputs: ride height, crossweight e corner weights.</p>
    </section>
  );
}
