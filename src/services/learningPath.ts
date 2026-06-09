import type { StudentProfile } from "@/store/appStore";
import {
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  type MathModule,
  type ModuleInfo,
} from "@/types/curriculum";
import { computeModuleScores, weakestModule } from "@/utils/skillStats";

export interface PathStep {
  module: MathModule;
  indexInModule: number;
  totalInModule: number;
  moduleLabel: string;
  moduleIcon: string;
}

/** Đề ôn 10 câu/ngày — ưu tiên module yếu, phân bổ theo curriculum lớp */
export function buildDailyExam(profile: StudentProfile): PathStep[] {
  const modules = getModulesForGrade(profile.grade);
  const scores = computeModuleScores(profile.events);
  const weak = weakestModule(
    scores,
    modules.map((m) => m.id)
  );

  const order = [...modules].sort((a, b) => {
    if (a.id === weak) return -1;
    if (b.id === weak) return 1;
    const accA = scores[a.id]?.accuracy ?? 0;
    const accB = scores[b.id]?.accuracy ?? 0;
    return accA - accB;
  });

  const path: PathStep[] = [];
  const counts: Record<string, number> = {};

  for (const mod of modules) counts[mod.id] = 0;

  while (path.length < DAILY_QUESTION_COUNT) {
    let added = false;
    for (const mod of order) {
      if (counts[mod.id] < mod.dailyCount) {
        counts[mod.id]++;
        path.push(stepFrom(mod, counts[mod.id]));
        added = true;
        if (path.length >= DAILY_QUESTION_COUNT) break;
      }
    }
    if (!added) break;
  }

  return path;
}

function stepFrom(mod: ModuleInfo, index: number): PathStep {
  return {
    module: mod.id,
    indexInModule: index,
    totalInModule: mod.dailyCount,
    moduleLabel: mod.label,
    moduleIcon: mod.icon,
  };
}

/** Vị trí câu tiếp theo dựa trên tiến độ module đã lưu */
export function getStartStepIndex(
  path: PathStep[],
  progress: Record<MathModule, number>
): number {
  const remaining = { ...progress };
  for (let i = 0; i < path.length; i++) {
    const mod = path[i].module;
    if ((remaining[mod] ?? 0) > 0) {
      remaining[mod]--;
    } else {
      return i;
    }
  }
  return path.length;
}

export function getPathRecommendation(profile: StudentProfile): string {
  const modules = getModulesForGrade(profile.grade);
  const scores = computeModuleScores(profile.events);
  const weak = weakestModule(
    scores,
    modules.map((m) => m.id)
  );
  const weakInfo = modules.find((m) => m.id === weak);

  if ((scores[weak]?.total ?? 0) === 0) {
    return `Hôm nay ôn ${DAILY_QUESTION_COUNT} câu trọng tâm lớp ${profile.grade}.`;
  }

  if ((scores[weak]?.accuracy ?? 0) < 60) {
    return `Nên tập trung ${weakInfo?.label ?? "module yếu"} (${scores[weak]?.accuracy}% đúng).`;
  }

  return `Tiến bộ tốt! Hôm nay ưu tiên ${weakInfo?.label ?? "ôn tập"} để củng cố.`;
}
