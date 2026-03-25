export type CurvePhase = "entrada" | "meio" | "saida" | "transicao" | "long_run";

export type SetupSection = {
  title: string;
  fields: Record<string, number | string>;
};

export type Setup = {
  id: string;
  name: string;
  carClass: "NASCAR_NEXT_GEN_A";
  trackId?: string;
  createdAt: string;
  sections: SetupSection[];
  inputs: Record<string, number>;
  outputs: Record<string, number>;
};

export type TrackProfile = {
  id: string;
  nome: string;
  tipo: string;
  comprimentoMi: number;
  banking: string;
  abrasividade: "baixa" | "media" | "alta";
  linhasPreferenciais: string;
  exigenciaFreio: number;
  exigenciaRotacao: number;
  sensibilidadeDesgaste: number;
  tendenciaNextGen: string;
  prioridadesSetup: string[];
  observacoes: string;
};

export type HandlingFeedback = {
  texto: string;
  phase: CurvePhase[];
  foco: "qualy" | "long_run" | "misto";
};

export type RecommendationLevel = "leve" | "moderado" | "agressivo" | "extremo";

export type RecommendationStep = {
  parameter: string;
  direction: "up" | "down";
  step: number;
  reason: string;
  expected: string;
  risk: string;
  stopWhen: string;
};

export type Recommendation = {
  symptom: string;
  phase: CurvePhase;
  priority: number;
  adjustableOnly: boolean;
  steps: RecommendationStep[];
};

export type AdjustmentRule = {
  symptomKeywords: string[];
  phase: CurvePhase;
  reaction: string;
  action: string;
  consequence: string;
  limit: string;
  nextStep: string;
  recommendations: Recommendation;
};
