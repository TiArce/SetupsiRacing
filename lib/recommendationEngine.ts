import { ADJUSTMENT_RULES } from "@/lib/seed";
import { HandlingFeedback, Recommendation, RecommendationLevel, RecommendationStep, Setup, TrackProfile } from "@/lib/types";

const LEVEL_SCALE: Record<RecommendationLevel, number> = {
  leve: 1,
  moderado: 1.5,
  agressivo: 2.2,
  extremo: 3
};

export function classifyFeedback(texto: string): HandlingFeedback {
  const low = texto.toLowerCase();
  const phase = [] as HandlingFeedback["phase"];
  if (low.includes("entrada")) phase.push("entrada");
  if (low.includes("meio") || low.includes("centro")) phase.push("meio");
  if (low.includes("saída") || low.includes("saida")) phase.push("saida");
  if (low.includes("transição") || low.includes("transicao")) phase.push("transicao");
  if (low.includes("long") || low.includes("15 voltas")) phase.push("long_run");

  return {
    texto,
    phase: phase.length ? phase : ["entrada", "meio", "saida"],
    foco: low.includes("qualy") ? "qualy" : low.includes("long") ? "long_run" : "misto"
  };
}

export function diagnose(feedbackText: string): Recommendation[] {
  const low = feedbackText.toLowerCase();
  return ADJUSTMENT_RULES
    .filter((rule) => rule.symptomKeywords.some((k) => low.includes(k)))
    .map((rule) => rule.recommendations)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2);
}

export function gradualRecommendation(step: RecommendationStep, current: number, level: RecommendationLevel) {
  const factor = LEVEL_SCALE[level];
  const delta = Number((step.step * factor).toFixed(2));
  const suggested = step.direction === "up" ? current + delta : current - delta;

  return {
    atual: current,
    sugerido: Number(suggested.toFixed(2)),
    efeito: step.expected,
    risco: step.risk,
    pararQuando: step.stopWhen
  };
}

export function aggregateComparisonEffect(base: Setup, candidate: Setup, track?: TrackProfile): string[] {
  const insights: string[] = [];
  if ((candidate.inputs.diffPreloadNm ?? 0) < (base.inputs.diffPreloadNm ?? 0)) {
    insights.push("Mais agressivo de saída por diferencial mais livre.");
  }
  if ((candidate.inputs.rrLsCompression ?? 0) > (base.inputs.rrLsCompression ?? 0)) {
    insights.push("Maior suporte de traseira em tração e long run.");
  }
  if ((candidate.inputs.rfCamber ?? 0) > (base.inputs.rfCamber ?? 0)) {
    insights.push("RF menos negativo: tende a preservar pneu no stint.");
  }
  if (track?.id === "homestead") {
    insights.push("Em Homestead, priorize observar temperatura do RR após 10-15 voltas.");
  }
  return insights.slice(0, 4);
}
