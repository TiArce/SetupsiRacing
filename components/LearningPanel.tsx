const MAP: Record<string, string> = {
  diffPreloadNm: "Diff Preload controla o grau de bloqueio inicial do diferencial. Menor valor aumenta rotação de saída e risco de wheelspin.",
  rrLsCompression: "LS Compression traseiro controla a velocidade de compressão em baixa velocidade do amortecedor, influenciando suporte de carga em aceleração.",
  rrLsRebound: "LS Rebound traseiro segura o retorno, mantendo carga por mais tempo no pneu e alterando drive de saída.",
  rearArbPreload: "Rear ARB muda distribuição lateral de carga no eixo traseiro. Menos preload normalmente melhora tração, mas pode reduzir resposta.",
  lrToe: "Toe traseiro afeta estabilidade em reta e geração de yaw na transição.",
  rfCamber: "Camber RF influencia patch de contato em roll e a gestão térmica do pneu em long run."
};

export function LearningPanel({ selectedParam }: { selectedParam: string }) {
  return (
    <section className="card">
      <h2>8) Aprendizado / Lógica do setup</h2>
      <p><strong>Parâmetro selecionado:</strong> {selectedParam || "(clique em um parâmetro no setup)"}</p>
      <p>{MAP[selectedParam] ?? "Setup é sistema de transferência de carga: analise causa/efeito por fase da curva, não números mágicos."}</p>
      <ul>
        <li>Push na saída frequentemente nasce na traseira (diff/traseiro), não só na dianteira.</li>
        <li>Entrada, meio e saída exigem diagnósticos separados.</li>
        <li>Qualy e long run podem pedir direções opostas de ajuste.</li>
      </ul>
    </section>
  );
}
