"use client";

import { DecisionMatrix } from "@/components/DecisionMatrix";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { Diagrams } from "@/components/Diagrams";
import { LearningPanel } from "@/components/LearningPanel";
import { SetupCards } from "@/components/SetupCards";
import { SetupImport } from "@/components/SetupImport";
import { SimulatorPanel } from "@/components/SimulatorPanel";
import { SAMPLE_SETUP, TRACKS } from "@/lib/seed";
import { saveSetups, loadSetups } from "@/lib/storage";
import { Setup } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [setup, setSetup] = useState<Setup | undefined>(SAMPLE_SETUP);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0].id);
  const [selectedParam, setSelectedParam] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => setSavedCount(loadSetups().length), []);

  const track = useMemo(() => TRACKS.find((t) => t.id === selectedTrack), [selectedTrack]);

  const onSaveVersion = () => {
    if (!setup) return;
    const all = [setup, ...loadSetups()];
    saveSetups(all);
    setSavedCount(all.length);
  };

  return (
    <main className="container">
      <section className="card flow">
        <h2>Fluxo de engenharia recomendado</h2>
        <p>Selecionar pista → colar setup → relatar problema → ver diagnóstico → aplicar recomendação → salvar nova versão.</p>
        <select className="input" value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}>
          {TRACKS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <p className="muted">Pista: <strong>{track?.nome}</strong> · Prioridades: {track?.prioridadesSetup.join(" · ")}</p>
        <button className="button" onClick={onSaveVersion}>Salvar versão ({savedCount})</button>
      </section>

      <SetupImport onParsed={setSetup} />
      <SetupCards setup={setup} onSelectParam={setSelectedParam} />
      <SimulatorPanel setup={setup} />
      <DiagnosisPanel setup={setup} />
      <DecisionMatrix />
      <Diagrams />
      <LearningPanel selectedParam={selectedParam} />
    </main>
  );
}
