import { AdjustmentRule, Setup, TrackProfile } from "@/lib/types";

export const TRACKS: TrackProfile[] = [
  { id: "homestead", nome: "Homestead-Miami", tipo: "Oval Intermediária", comprimentoMi: 1.5, banking: "18°-20° progressivo", abrasividade: "alta", linhasPreferenciais: "Alta dominante no long run", exigenciaFreio: 4, exigenciaRotacao: 9, sensibilidadeDesgaste: 10, tendenciaNextGen: "RR aquece rápido; saída manda no pace", prioridadesSetup: ["Controle do RR", "Tração de saída", "Gestão térmica"], observacoes: "Evitar snap oversteer ao aplicar throttle cedo na linha alta." },
  { id: "pocono", nome: "Pocono", tipo: "Tri-oval", comprimentoMi: 2.5, banking: "6°/8°/14°", abrasividade: "media", linhasPreferenciais: "Compromisso entre T1-T2-T3", exigenciaFreio: 8, exigenciaRotacao: 7, sensibilidadeDesgaste: 7, tendenciaNextGen: "Setup de compromisso entre três curvas", prioridadesSetup: ["Entrada", "Freio", "Compromisso global"], observacoes: "Defina curva prioritária para stint." },
  { id: "phoenix", nome: "Phoenix", tipo: "Oval curta", comprimentoMi: 1, banking: "8°-11°", abrasividade: "media", linhasPreferenciais: "Baixa na qualy, variação no race", exigenciaFreio: 8, exigenciaRotacao: 8, sensibilidadeDesgaste: 7, tendenciaNextGen: "Transição entrada/meio crítica", prioridadesSetup: ["Entry", "Rotação de centro", "Drive"], observacoes: "Controle de lockup do RF é chave." },
  { id: "new-hampshire", nome: "New Hampshire", tipo: "Flat oval", comprimentoMi: 1.058, banking: "2°-7°", abrasividade: "media", linhasPreferenciais: "Baixa técnica", exigenciaFreio: 9, exigenciaRotacao: 9, sensibilidadeDesgaste: 8, tendenciaNextGen: "Push de entrada comum", prioridadesSetup: ["Freio", "Entrada", "Rotação em baixa"], observacoes: "Release do freio define tempo de volta." },
  { id: "gateway", nome: "Gateway", tipo: "Oval 1.25", comprimentoMi: 1.25, banking: "11°", abrasividade: "media", linhasPreferenciais: "Frear reto e apontar cedo", exigenciaFreio: 8, exigenciaRotacao: 8, sensibilidadeDesgaste: 7, tendenciaNextGen: "Saída de curva longa penaliza", prioridadesSetup: ["Tração", "Estabilidade no bump", "Freio"], observacoes: "Tratar T1/T2 e T3/T4 separadamente." },
  { id: "kentucky", nome: "Kentucky", tipo: "Intermediária", comprimentoMi: 1.5, banking: "14°-17°", abrasividade: "media", linhasPreferenciais: "Múltiplas linhas", exigenciaFreio: 5, exigenciaRotacao: 8, sensibilidadeDesgaste: 7, tendenciaNextGen: "Muito sensível ao equilíbrio de meio/saída", prioridadesSetup: ["Rotação de meio", "Drive de saída", "RF temp"], observacoes: "Não matar rotação por excesso de segurança traseira." },
  { id: "las-vegas", nome: "Las Vegas", tipo: "Intermediária", comprimentoMi: 1.5, banking: "20°", abrasividade: "media", linhasPreferenciais: "Alta no race", exigenciaFreio: 4, exigenciaRotacao: 7, sensibilidadeDesgaste: 6, tendenciaNextGen: "Pede carro livre no centro", prioridadesSetup: ["Centro", "Constância long run", "Temperatura RF"], observacoes: "Compromisso qualy x run longo." },
  { id: "atlanta", nome: "Atlanta (novo)", tipo: "Superspeedway style", comprimentoMi: 1.54, banking: "28°", abrasividade: "media", linhasPreferenciais: "Pack / múltiplas faixas", exigenciaFreio: 2, exigenciaRotacao: 4, sensibilidadeDesgaste: 5, tendenciaNextGen: "Draft + estabilidade", prioridadesSetup: ["Drag", "Estabilidade em pack", "Temperatura"], observacoes: "Toe e cambagem agressivos podem matar reta." },
  { id: "auto-club", nome: "Auto Club", tipo: "2 milhas", comprimentoMi: 2, banking: "14°", abrasividade: "alta", linhasPreferenciais: "Alta e variação", exigenciaFreio: 5, exigenciaRotacao: 8, sensibilidadeDesgaste: 10, tendenciaNextGen: "Desgaste extremo em long run", prioridadesSetup: ["Gestão pneus", "Saída limpa", "RF/LR balance"], observacoes: "Acompanhar queda de grip após 12+ voltas." },
  { id: "kansas", nome: "Kansas", tipo: "Intermediária", comprimentoMi: 1.5, banking: "17°-20°", abrasividade: "media", linhasPreferenciais: "Alta eficiente", exigenciaFreio: 4, exigenciaRotacao: 8, sensibilidadeDesgaste: 7, tendenciaNextGen: "Carro precisa rotacionar sem perder drive", prioridadesSetup: ["Rotação de saída", "RR controle", "Plataforma estável"], observacoes: "Rear rebound costuma ser alavanca principal." },
  { id: "michigan", nome: "Michigan", tipo: "2 milhas", comprimentoMi: 2, banking: "18°", abrasividade: "baixa", linhasPreferenciais: "Largura de pista favorece linhas alternativas", exigenciaFreio: 3, exigenciaRotacao: 6, sensibilidadeDesgaste: 5, tendenciaNextGen: "Velocidade final e estabilidade aero", prioridadesSetup: ["Drag", "Estabilidade entrada alta", "Direção precisa"], observacoes: "Evitar excesso de arrasto mecânico." },
  { id: "charlotte", nome: "Charlotte", tipo: "Intermediária", comprimentoMi: 1.5, banking: "24°", abrasividade: "media", linhasPreferenciais: "Linha alta no race", exigenciaFreio: 4, exigenciaRotacao: 7, sensibilidadeDesgaste: 6, tendenciaNextGen: "Sensível a transição e bumps", prioridadesSetup: ["Plataforma", "Saída", "Consistência"], observacoes: "Use ajustes graduais, 2 mudanças por teste." },
  { id: "darlington", nome: "Darlington", tipo: "Intermediária egg-shaped", comprimentoMi: 1.366, banking: "23°-25°", abrasividade: "alta", linhasPreferenciais: "Muro e linha alta", exigenciaFreio: 6, exigenciaRotacao: 8, sensibilidadeDesgaste: 9, tendenciaNextGen: "T1/T2 e T3/T4 muito diferentes", prioridadesSetup: ["Compromisso entre pontas", "Controle de RR", "Durabilidade"], observacoes: "Setup nunca perfeito nos dois lados." },
  { id: "martinsville", nome: "Martinsville", tipo: "Short track", comprimentoMi: 0.526, banking: "12°", abrasividade: "media", linhasPreferenciais: "Baixa com forte frenagem", exigenciaFreio: 10, exigenciaRotacao: 9, sensibilidadeDesgaste: 7, tendenciaNextGen: "Freio e tração definem corrida", prioridadesSetup: ["Entrada sob freio", "Tração em baixa", "Temperatura traseira"], observacoes: "Excesso de preload gera push severo na saída." },
  { id: "richmond", nome: "Richmond", tipo: "Short/intermediate", comprimentoMi: 0.75, banking: "14°", abrasividade: "media", linhasPreferenciais: "Baixa no início, alta no stint", exigenciaFreio: 8, exigenciaRotacao: 8, sensibilidadeDesgaste: 8, tendenciaNextGen: "Balanço muda muito com combustível", prioridadesSetup: ["Versatilidade", "Centro", "Saída progressiva"], observacoes: "Carro deve aceitar múltiplas linhas." },
  { id: "bristol", nome: "Bristol", tipo: "Short high-bank", comprimentoMi: 0.533, banking: "24°-28°", abrasividade: "alta", linhasPreferenciais: "Alta predominante", exigenciaFreio: 6, exigenciaRotacao: 8, sensibilidadeDesgaste: 8, tendenciaNextGen: "Carga lateral contínua", prioridadesSetup: ["Estabilidade de centro", "Gestão térmica", "Resposta rápida"], observacoes: "Evite ajustes extremos que destroem pneu direito." },
  { id: "daytona", nome: "Daytona", tipo: "Superspeedway", comprimentoMi: 2.5, banking: "31°", abrasividade: "baixa", linhasPreferenciais: "Pack racing", exigenciaFreio: 2, exigenciaRotacao: 3, sensibilidadeDesgaste: 3, tendenciaNextGen: "Estabilidade + drag mínimo", prioridadesSetup: ["Baixo arrasto", "Estabilidade", "Temperatura"], observacoes: "Priorize sobrevivência no tráfego." },
  { id: "talladega", nome: "Talladega", tipo: "Superspeedway", comprimentoMi: 2.66, banking: "33°", abrasividade: "baixa", linhasPreferenciais: "Pack e runs longos", exigenciaFreio: 1, exigenciaRotacao: 2, sensibilidadeDesgaste: 2, tendenciaNextGen: "Previsibilidade no draft", prioridadesSetup: ["Estabilidade direcional", "Arrasto baixo", "Temperatura segura"], observacoes: "Mudanças mecânicas devem ser pequenas e coerentes." }
];

export const ADJUSTMENT_RULES: AdjustmentRule[] = [
  {
    symptomKeywords: ["push na saída", "sai de frente na saída", "não gira acelerando"],
    phase: "saida",
    reaction: "Push na saída",
    action: "Diff preload down → RR LS rebound up",
    consequence: "Mais rotação sob throttle e melhor sustentação do RR",
    limit: "Não reduzir preload abaixo de estabilidade mínima do piloto",
    nextStep: "Se persistir, reduzir rear ARB preload",
    recommendations: { symptom: "Push na saída", phase: "saida", priority: 1, adjustableOnly: true, steps: [
      { parameter: "diffPreloadNm", direction: "down", step: 3, reason: "Libera diferencial no power-down", expected: "Mais rotação na saída", risk: "Wheelspin / snap oversteer", stopWhen: "Carro começar a sair de traseira em throttle parcial" },
      { parameter: "rrLsRebound", direction: "up", step: 1, reason: "Sustenta carga no RR por mais tempo", expected: "Mais drive na saída", risk: "Carro preso no meio", stopWhen: "Perda de rolagem no centro aparecer" }
    ] }
  },
  {
    symptomKeywords: ["loose na saída", "traseira solta na saída"],
    phase: "saida",
    reaction: "Loose na saída",
    action: "Diff preload up → RR LS compression up",
    consequence: "Mais trava no diff e mais suporte de traseira",
    limit: "Evitar excesso para não gerar push crônico",
    nextStep: "Adicionar LR toe in com cautela",
    recommendations: { symptom: "Loose na saída", phase: "saida", priority: 1, adjustableOnly: true, steps: [
      { parameter: "diffPreloadNm", direction: "up", step: 3, reason: "Reduz diferença de rotação entre rodas traseiras", expected: "Mais estabilidade no throttle", risk: "Push de saída", stopWhen: "Retornar tração sem matar rotação" },
      { parameter: "rrLsCompression", direction: "up", step: 1, reason: "Suporta transferência para trás", expected: "Traseira mais plantada", risk: "Resposta lenta de tração", stopWhen: "Saída ficar neutra e previsível" }
    ] }
  },
  {
    symptomKeywords: ["traseira solta na entrada", "loose entry", "instável freando"],
    phase: "entrada",
    reaction: "Instabilidade de entrada",
    action: "Brake bias up + rear ARB preload down",
    consequence: "Mais segurança no release",
    limit: "Bias alto demais aumenta distância de frenagem",
    nextStep: "Revisar toe traseiro e bump stops",
    recommendations: { symptom: "Loose na entrada", phase: "entrada", priority: 1, adjustableOnly: true, steps: [
      { parameter: "brakeBias", direction: "up", step: 0.3, reason: "Desloca esforço de freio para dianteira", expected: "Entrada mais estável", risk: "Subesterço de entrada", stopWhen: "Parar lock traseiro e manter apontamento" },
      { parameter: "rearArbPreload", direction: "down", step: 10, reason: "Reduz rigidez de rolagem traseira inicial", expected: "Menos tendência de rodar no turn-in", risk: "Saída mais preguiçosa", stopWhen: "Transferência traseira ficar controlada" }
    ] }
  }
];

export const SAMPLE_SETUP: Setup = {
  id: "baseline-nextgen-a",
  name: "Baseline Homestead",
  carClass: "NASCAR_NEXT_GEN_A",
  trackId: "homestead",
  createdAt: new Date().toISOString(),
  sections: [
    { title: "Pneus", fields: { lfPsi: 27.5, rfPsi: 49, lrPsi: 21.5, rrPsi: 22.5 } },
    { title: "Diferencial", fields: { diffPreloadNm: 27, diffClutches: 4 } },
    { title: "Amortecedores traseiros", fields: { rrLsRebound: 6, rrLsCompression: 5, lrLsRebound: 5, lrLsCompression: 4 } },
    { title: "Barras", fields: { rearArbPreload: 120, frontArbArm: 3 } },
    { title: "Alinhamento", fields: { lrToe: 0.08, rrToe: -0.02, rfCamber: -3.6, lfCamber: 2.8 } }
  ],
  inputs: { diffPreloadNm: 27, rrLsRebound: 6, rrLsCompression: 5, rearArbPreload: 120, brakeBias: 53.8, lrToe: 0.08, rfCamber: -3.6 },
  outputs: { rideHeightFront: 2.9, rideHeightRear: 3.7, crossWeight: 50.3, cornerWeightRR: 785 }
};
