import { Setup, SetupSection } from "@/lib/types";

const KEY_MAP: Record<string, string> = {
  "diff preload": "diffPreloadNm",
  "differential preload": "diffPreloadNm",
  "rr ls rebound": "rrLsRebound",
  "rr ls compression": "rrLsCompression",
  "rear arb preload": "rearArbPreload",
  "brake bias": "brakeBias",
  "lr toe": "lrToe",
  "rf camber": "rfCamber",
  "lf psi": "lfPsi",
  "rf psi": "rfPsi",
  "lr psi": "lrPsi",
  "rr psi": "rrPsi"
};

const SECTION_HINTS = ["pneus", "tires", "chassis", "frente", "traseira", "diferencial", "barras", "amortecedores", "corner", "alinhamento"];

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[:=]/g, "").replace(/\s+/g, " ").trim();
}

function parseNumeric(raw: string): number | null {
  const normalized = raw.replace(",", ".");
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function parseSetupText(text: string, name = "Setup importado"): Setup {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const sections: SetupSection[] = [];
  const inputs: Record<string, number> = {};
  const outputs: Record<string, number> = {};

  let current: SetupSection = { title: "Geral", fields: {} };

  for (const line of lines) {
    const asSection = SECTION_HINTS.some((hint) => normalizeKey(line).includes(hint));
    if (asSection && !line.includes(":")) {
      if (Object.keys(current.fields).length > 0) sections.push(current);
      current = { title: line, fields: {} };
      continue;
    }

    const parts = line.split(/\t|:|=/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const rawKey = normalizeKey(parts[0]);
    const mapped = KEY_MAP[rawKey] ?? rawKey.replace(/\s+/g, "");
    const value = parseNumeric(parts.slice(1).join(" "));

    if (value !== null) {
      current.fields[mapped] = value;
      if (["rideheightfront", "rideheightrear", "crossweight", "cornerweightrr"].includes(mapped.toLowerCase())) {
        outputs[mapped] = value;
      } else {
        inputs[mapped] = value;
      }
    } else {
      current.fields[mapped] = parts.slice(1).join(" ");
    }
  }

  if (Object.keys(current.fields).length > 0) sections.push(current);

  return {
    id: crypto.randomUUID(),
    name,
    carClass: "NASCAR_NEXT_GEN_A",
    createdAt: new Date().toISOString(),
    sections,
    inputs,
    outputs
  };
}
