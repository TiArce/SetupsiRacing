import { TRACKS } from "@/lib/seed";

export default function PistasPage() {
  return (
    <main className="container">
      <section className="card">
        <h2>5) Banco de pistas ovais iRacing (Class A Next Gen)</h2>
        <div className="grid2">
          {TRACKS.map((t) => (
            <article className="subcard" key={t.id}>
              <h3>{t.nome}</h3>
              <p><strong>Tipo:</strong> {t.tipo} · <strong>Comprimento:</strong> {t.comprimentoMi} mi · <strong>Banking:</strong> {t.banking}</p>
              <p><strong>Abrasividade:</strong> {t.abrasividade} · <strong>Freio:</strong> {t.exigenciaFreio}/10 · <strong>Rotação:</strong> {t.exigenciaRotacao}/10</p>
              <p><strong>Desgaste:</strong> {t.sensibilidadeDesgaste}/10 · <strong>Linhas:</strong> {t.linhasPreferenciais}</p>
              <p><strong>Tendência Next Gen:</strong> {t.tendenciaNextGen}</p>
              <p><strong>Prioridades:</strong> {t.prioridadesSetup.join(" · ")}</p>
              <p className="muted">{t.observacoes}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
