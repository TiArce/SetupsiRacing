import { Setup } from "@/lib/types";

const KEY = "nextgen_setup_versions_v1";

export function loadSetups(): Setup[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Setup[];
  } catch {
    return [];
  }
}

export function saveSetups(setups: Setup[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(setups));
}
