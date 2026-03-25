"use client";

import { aggregateComparisonEffect } from "@/lib/recommendationEngine";
import { SAMPLE_SETUP, TRACKS } from "@/lib/seed";
import { loadSetups } from "@/lib/storage";
import { Setup } from "@/lib/types";
import { useMemo, useState } from "react";

export default function ComparacaoPage() {
  const setups = [SAMPLE_SETUP, ...loadSetups()];
  const [a, setA] = useState<Setup>(setups[0]);
  const [b, setB] = useState<Setup>(setups[Math.min(1, setups.length - 1)]);

  const diffs = useMemo(() => {
    return Object.keys({ ...a.inputs, ...b.inputs })
      .map((key) => ({ key, av: a.inputs[key], bv: b.inputs[key] }))
      .filter((x) => x.av !== x.bv);
  }, [a, b]);

  const effects = aggregateComparisonEffect(a, b, TRACKS.find((t) => t.id === (b.trackId ?? "homestead")));

  return (
    <main className="container">
      <section className="card">
        <h2>7) Comparação de setups lado a lado</h2>
        <div className="grid2">
          <select className="input" value={a.id} onChange={(e) => setA(setups.find((s) => s.id === e.target.value) ?? setups[0])}>{setups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select className="input" value={b.id} onChange={(e) => setB(setups.find((s) => s.id === e.target.value) ?? setups[0])}>{setups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        </div>
        <div className="tableWrap">
          <table><thead><tr><th>Parâmetro</th><th>{a.name}</th><th>{b.name}</th></tr></thead><tbody>
            {diffs.map((d) => <tr key={d.key}><td>{d.key}</td><td>{String(d.av ?? "-")}</td><td><strong>{String(d.bv ?? "-")}</strong></td></tr>)}
          </tbody></table>
        </div>
        <h3>Efeito agregado provável</h3>
        <ul>{effects.map((e) => <li key={e}>{e}</li>)}</ul>
      </section>
    </main>
  );
}
