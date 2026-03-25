import { Setup } from "@/lib/types";

export function SetupCards({ setup, onSelectParam }: { setup?: Setup; onSelectParam: (param: string) => void }) {
  if (!setup) return <section className="card"><h2>Setup</h2><p className="muted">Aguardando importação.</p></section>;

  return (
    <section className="card">
      <h2>Setup lido: {setup.name}</h2>
      <div className="grid2">
        {setup.sections.map((sec) => (
          <article key={sec.title} className="subcard">
            <h3>{sec.title}</h3>
            <ul>
              {Object.entries(sec.fields).map(([k, v]) => (
                <li key={k}><button className="linkBtn" onClick={() => onSelectParam(k)}>{k}</button>: <strong>{String(v)}</strong></li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="muted">Outputs (ride height/crossweight/corner weight) aparecem como consequência, não como ajuste direto.</p>
    </section>
  );
}
