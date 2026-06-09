import type { MathEvent } from "@/store/appStore";

export interface ModuleScore {
  total: number;
  correct: number;
  accuracy: number;
}

export function computeModuleScores(events: MathEvent[]): Record<string, ModuleScore> {
  const base: Record<string, ModuleScore> = {};
  for (const e of events) {
    const key = String(e.module);
    if (!base[key]) base[key] = { total: 0, correct: 0, accuracy: 0 };
    base[key].total++;
    if (e.correct) base[key].correct++;
  }
  for (const key of Object.keys(base)) {
    const s = base[key];
    s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }
  return base;
}

export function weakestModule(
  scores: Record<string, ModuleScore>,
  modules: string[]
): string {
  let weak = modules[0];
  let lowest = 101;
  for (const m of modules) {
    const s = scores[m] ?? { total: 0, correct: 0, accuracy: 0 };
    const score = s.total === 0 ? 0 : s.accuracy;
    if (score < lowest) {
      lowest = score;
      weak = m;
    }
  }
  return weak;
}
