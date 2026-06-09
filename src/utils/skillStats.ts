import type { MathModule } from "@/types/curriculum";
import type { MathEvent } from "@/store/appStore";

export interface ModuleScore {
  total: number;
  correct: number;
  accuracy: number;
}

export function computeModuleScores(events: MathEvent[]): Record<MathModule, ModuleScore> {
  const base: Record<string, ModuleScore> = {};
  for (const e of events) {
    if (!base[e.module]) base[e.module] = { total: 0, correct: 0, accuracy: 0 };
    base[e.module].total++;
    if (e.correct) base[e.module].correct++;
  }
  for (const key of Object.keys(base)) {
    const s = base[key];
    s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }
  return base as Record<MathModule, ModuleScore>;
}

export function weakestModule(
  scores: Record<MathModule, ModuleScore>,
  modules: MathModule[]
): MathModule {
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
