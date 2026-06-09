import type { StudentProfile } from "@/store/appStore";
import {
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  getTopicLabel,
  type ModuleInfo,
} from "@/types/curriculum";
import {
  ALL_GRADE5_TOPIC_IDS,
  getGrade5TopicIcon,
  type Grade5TopicId,
} from "@/types/grade5Curriculum";
import { computeModuleScores, weakestModule } from "@/utils/skillStats";

export interface PathStep {
  topicId: string;
  topicLabel: string;
  topicIcon: string;
  indexInTopic: number;
  totalInTopic: number;
}

function getActiveGrade5Topics(profile: StudentProfile): Grade5TopicId[] {
  const selected = profile.selectedGrade5Topics;
  if (selected === null) return ALL_GRADE5_TOPIC_IDS;
  if (selected.length === 0) return ALL_GRADE5_TOPIC_IDS;
  return selected;
}

function buildGrade5Exam(profile: StudentProfile): PathStep[] {
  const topics = getActiveGrade5Topics(profile);
  const scores = computeModuleScores(profile.events);
  const weak = weakestModule(scores, topics);

  const order = [...topics].sort((a, b) => {
    if (a === weak) return -1;
    if (b === weak) return 1;
    return (scores[a]?.accuracy ?? 0) - (scores[b]?.accuracy ?? 0);
  });

  const counts: Record<string, number> = {};
  for (const t of topics) counts[t] = 0;

  const perTopic = Math.max(1, Math.floor(DAILY_QUESTION_COUNT / topics.length));
  const caps: Record<string, number> = {};
  for (const t of topics) caps[t] = perTopic;
  let remainder = DAILY_QUESTION_COUNT - perTopic * topics.length;
  for (let i = 0; i < remainder; i++) caps[order[i % order.length]]++;

  const path: PathStep[] = [];
  while (path.length < DAILY_QUESTION_COUNT) {
    let added = false;
    for (const topicId of order) {
      if (counts[topicId] < caps[topicId]) {
        counts[topicId]++;
        path.push(stepFromTopic(topicId, counts[topicId], caps[topicId]));
        added = true;
        if (path.length >= DAILY_QUESTION_COUNT) break;
      }
    }
    if (!added) break;
  }

  return path;
}

function stepFromTopic(topicId: string, index: number, total: number): PathStep {
  return {
    topicId,
    topicLabel: getTopicLabel(topicId, 5),
    topicIcon: getGrade5TopicIcon(topicId as Grade5TopicId),
    indexInTopic: index,
    totalInTopic: total,
  };
}

function stepFromModule(mod: ModuleInfo, index: number): PathStep {
  return {
    topicId: mod.id,
    topicLabel: mod.label,
    topicIcon: mod.icon,
    indexInTopic: index,
    totalInTopic: mod.dailyCount,
  };
}

/** Đề ôn 10 câu/ngày — ưu tiên chủ đề yếu */
export function buildDailyExam(profile: StudentProfile): PathStep[] {
  if (profile.grade === 5) return buildGrade5Exam(profile);

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
        path.push(stepFromModule(mod, counts[mod.id]));
        added = true;
        if (path.length >= DAILY_QUESTION_COUNT) break;
      }
    }
    if (!added) break;
  }

  return path;
}

export function getStartStepIndex(path: PathStep[], progress: Record<string, number>): number {
  const remaining = { ...progress };
  for (let i = 0; i < path.length; i++) {
    const id = path[i].topicId;
    if ((remaining[id] ?? 0) > 0) {
      remaining[id]--;
    } else {
      return i;
    }
  }
  return path.length;
}

export function getPathRecommendation(profile: StudentProfile): string {
  if (profile.grade === 5) {
    const topics = getActiveGrade5Topics(profile);
    const selected = profile.selectedGrade5Topics?.length ?? 0;
    if (selected > 0 && selected < ALL_GRADE5_TOPIC_IDS.length) {
      return `Đề hôm nay gồm ${topics.length} chủ đề bạn đã chọn.`;
    }
    return `Hôm nay ôn ${DAILY_QUESTION_COUNT} câu từ ${ALL_GRADE5_TOPIC_IDS.length} chủ đề lớp 5.`;
  }

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
    return `Nên tập trung ${weakInfo?.label ?? "chủ đề yếu"} (${scores[weak]?.accuracy}% đúng).`;
  }

  return `Tiến bộ tốt! Hôm nay ưu tiên ${weakInfo?.label ?? "ôn tập"} để củng cố.`;
}
