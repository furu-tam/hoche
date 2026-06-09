import type { Difficulty } from "@/types/question";
import type { MathModule } from "@/types/curriculum";
import type { MathEvent } from "@/store/appStore";

export function initialDifficultyForGrade(grade: number): Difficulty {
  if (grade <= 2) return 1;
  if (grade <= 4) return 2;
  return 2;
}

export function nextDifficulty(
  current: Difficulty,
  recent: MathEvent[],
  module: MathModule
): Difficulty {
  const moduleEvents = recent.filter((e) => e.module === module).slice(-3);
  if (moduleEvents.length < 2) return current;

  const correct = moduleEvents.filter((e) => e.correct).length;
  const accuracy = correct / moduleEvents.length;
  const avgTime =
    moduleEvents.reduce((s, e) => s + e.responseTime, 0) / moduleEvents.length;

  if (accuracy >= 0.8 && avgTime <= 12 && current < 3) return (current + 1) as Difficulty;
  if (accuracy < 0.5 || moduleEvents.slice(-2).every((e) => !e.correct)) {
    if (current > 1) return (current - 1) as Difficulty;
  }
  return current;
}
