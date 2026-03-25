export function Diagrams() {
  return (
    <section className="card">
      <h2>6) Visualização gráfica</h2>
      <div className="grid2">
        <article className="subcard">
          <h3>Fases da curva</h3>
          <svg viewBox="0 0 260 120" className="svgBox"><path d="M10 95 Q130 15 250 95" fill="none" stroke="#94a3b8" strokeWidth="10"/><text x="20" y="108">Entrada</text><text x="110" y="20">Meio</text><text x="205" y="108">Saída</text></svg>
        </article>
        <article className="subcard">
          <h3>Transferência de carga</h3>
          <svg viewBox="0 0 260 120" className="svgBox"><rect x="50" y="25" width="160" height="70" rx="8" fill="#1f2937"/><circle cx="75" cy="95" r="12" fill="#f59e0b"/><circle cx="185" cy="95" r="16" fill="#ef4444"/><text x="12" y="18">Aceleração: carga migra para traseira (RR/LR)</text></svg>
        </article>
      </div>
    </section>
  );
}
