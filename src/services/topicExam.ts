import { DAILY_QUESTION_COUNT } from "@/types/curriculum";
import type { ModuleScore } from "@/utils/skillStats";
import { weakestModule } from "@/utils/skillStats";
import type { PathStep } from "@/services/learningPath";

export function buildTopicBasedExam(
  topicIds: string[],
  scores: Record<string, ModuleScore>,
  makeStep: (topicId: string, index: number, total: number) => PathStep
): PathStep[] {
  const weak = weakestModule(scores, topicIds);
  const order = [...topicIds].sort((a, b) => {
    if (a === weak) return -1;
    if (b === weak) return 1;
    return (scores[a]?.accuracy ?? 0) - (scores[b]?.accuracy ?? 0);
  });

  const counts: Record<string, number> = {};
  for (const t of topicIds) counts[t] = 0;

  const perTopic = Math.max(1, Math.floor(DAILY_QUESTION_COUNT / topicIds.length));
  const caps: Record<string, number> = {};
  for (const t of topicIds) caps[t] = perTopic;
  const remainder = DAILY_QUESTION_COUNT - perTopic * topicIds.length;
  for (let i = 0; i < remainder; i++) caps[order[i % order.length]]++;

  const path: PathStep[] = [];
  while (path.length < DAILY_QUESTION_COUNT) {
    let added = false;
    for (const topicId of order) {
      if (counts[topicId] < caps[topicId]) {
        counts[topicId]++;
        path.push(makeStep(topicId, counts[topicId], caps[topicId]));
        added = true;
        if (path.length >= DAILY_QUESTION_COUNT) break;
      }
    }
    if (!added) break;
  }

  return path;
}
