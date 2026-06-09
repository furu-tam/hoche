import type { StudentProfile } from "@/store/appStore";
import {
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  getTopicLabel,
  type ModuleInfo,
} from "@/types/curriculum";
import {
  ALL_GRADE1_TOPIC_IDS,
  getGrade1TopicIcon,
  type Grade1TopicId,
} from "@/types/grade1Curriculum";
import {
  ALL_GRADE5_TOPIC_IDS,
  getGrade5TopicIcon,
  type Grade5TopicId,
} from "@/types/grade5Curriculum";
import { buildTopicBasedExam } from "@/services/topicExam";
import { computeModuleScores, weakestModule } from "@/utils/skillStats";

export interface PathStep {
  topicId: string;
  topicLabel: string;
  topicIcon: string;
  indexInTopic: number;
  totalInTopic: number;
}

function getActiveGrade1Topics(profile: StudentProfile): Grade1TopicId[] {
  const selected = profile.selectedGrade1Topics;
  if (selected === null) return ALL_GRADE1_TOPIC_IDS;
  if (selected.length === 0) return ALL_GRADE1_TOPIC_IDS;
  return selected;
}

function getActiveGrade5Topics(profile: StudentProfile): Grade5TopicId[] {
  const selected = profile.selectedGrade5Topics;
  if (selected === null) return ALL_GRADE5_TOPIC_IDS;
  if (selected.length === 0) return ALL_GRADE5_TOPIC_IDS;
  return selected;
}

function stepFromTopic(topicId: string, grade: 1 | 5, index: number, total: number): PathStep {
  return {
    topicId,
    topicLabel: getTopicLabel(topicId, grade),
    topicIcon:
      grade === 1
        ? getGrade1TopicIcon(topicId as Grade1TopicId)
        : getGrade5TopicIcon(topicId as Grade5TopicId),
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
  const scores = computeModuleScores(profile.events);

  if (profile.grade === 1) {
    const topics = getActiveGrade1Topics(profile);
    return buildTopicBasedExam(topics, scores, (id, i, t) => stepFromTopic(id, 1, i, t));
  }

  if (profile.grade === 5) {
    const topics = getActiveGrade5Topics(profile);
    return buildTopicBasedExam(topics, scores, (id, i, t) => stepFromTopic(id, 5, i, t));
  }

  const modules = getModulesForGrade(profile.grade);
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
  if (profile.grade === 1) {
    const topics = getActiveGrade1Topics(profile);
    const selected = profile.selectedGrade1Topics?.length ?? 0;
    if (selected > 0 && selected < ALL_GRADE1_TOPIC_IDS.length) {
      return `Đề hôm nay gồm ${topics.length} chủ đề bạn đã chọn.`;
    }
    return `Hôm nay ôn ${DAILY_QUESTION_COUNT} câu từ ${ALL_GRADE1_TOPIC_IDS.length} chủ đề lớp 1.`;
  }

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
