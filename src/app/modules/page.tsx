"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { ProfileBadge } from "@/components/ui/ProfileBadge";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import {
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  GRADE1_CURRICULUM,
  GRADE5_CURRICULUM,
  isTopicBasedGrade,
} from "@/types/curriculum";
import { ALL_GRADE1_TOPIC_IDS } from "@/types/grade1Curriculum";
import { ALL_GRADE5_TOPIC_IDS } from "@/types/grade5Curriculum";
import { useAppStore } from "@/store/appStore";

type TopicChapter = {
  id: string;
  label: string;
  icon: string;
  topics: { id: string; label: string; description: string }[];
};

const TOPIC_GRADE_CONFIG = {
  1: {
    curriculum: GRADE1_CURRICULUM as TopicChapter[],
    allIds: ALL_GRADE1_TOPIC_IDS,
    title: "Chương trình lớp 1",
  },
  5: {
    curriculum: GRADE5_CURRICULUM as TopicChapter[],
    allIds: ALL_GRADE5_TOPIC_IDS,
    title: "Chương trình lớp 5",
  },
} as const;

export default function ModulesPage() {
  const profile = useActiveProfile();
  const modules = getModulesForGrade(profile.grade);
  const toggleGrade1Topic = useAppStore((s) => s.toggleGrade1Topic);
  const setSelectedGrade1Topics = useAppStore((s) => s.setSelectedGrade1Topics);
  const toggleGrade5Topic = useAppStore((s) => s.toggleGrade5Topic);
  const setSelectedGrade5Topics = useAppStore((s) => s.setSelectedGrade5Topics);
  const resetTodayExam = useAppStore((s) => s.resetTodayExam);

  const topicGrade = isTopicBasedGrade(profile.grade) ? profile.grade : null;
  const config = topicGrade ? TOPIC_GRADE_CONFIG[topicGrade] : null;

  const selected =
    topicGrade === 1
      ? profile.selectedGrade1Topics
      : topicGrade === 5
        ? profile.selectedGrade5Topics
        : null;

  const activeIds = useMemo(() => {
    if (!config) return new Set<string>();
    if (selected === null) return new Set(config.allIds);
    return new Set(selected);
  }, [config, selected]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    config
      ? Object.fromEntries(config.curriculum.map((c) => [c.id, true]))
      : {}
  );

  const isSelected = (id: string) => activeIds.has(id);

  const toggleTopic = (id: string) => {
    if (topicGrade === 1) toggleGrade1Topic(id as (typeof ALL_GRADE1_TOPIC_IDS)[number]);
    if (topicGrade === 5) toggleGrade5Topic(id as (typeof ALL_GRADE5_TOPIC_IDS)[number]);
  };

  const selectAll = () => {
    if (topicGrade === 1) setSelectedGrade1Topics(null);
    if (topicGrade === 5) setSelectedGrade5Topics(null);
  };

  const selectNone = () => {
    if (topicGrade === 1) setSelectedGrade1Topics([]);
    if (topicGrade === 5) setSelectedGrade5Topics([]);
  };

  const applySelection = () => {
    if (!config || !topicGrade) return;
    const ids = [...activeIds];
    const allSelected = ids.length === config.allIds.length;
    if (topicGrade === 1) {
      setSelectedGrade1Topics(allSelected ? null : (ids as typeof ALL_GRADE1_TOPIC_IDS));
    } else {
      setSelectedGrade5Topics(allSelected ? null : (ids as typeof ALL_GRADE5_TOPIC_IDS));
    }
    resetTodayExam();
  };

  if (!topicGrade || !config) {
    return (
      <div className="page-wrap">
        <AppShell activeNav="modules">
          <main className="flex flex-1 flex-col px-4 py-5">
            <div className="mb-4">
              <ProfileBadge />
            </div>
            <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Chủ đề lớp {profile.grade}</h1>
            <p className="mb-5 text-sm text-mq-muted">
              Mỗi ngày hệ thống tạo {DAILY_QUESTION_COUNT} câu từ các module trọng tâm sau:
            </p>
            <div className="flex flex-col gap-3">
              {modules.map((m) => (
                <div key={m.id} className="rounded-mq-sm bg-white p-4 shadow-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl">{m.icon}</span>
                    <h3 className="font-extrabold">{m.label}</h3>
                  </div>
                  <p className="text-sm text-mq-muted">{m.description}</p>
                  <p className="mt-2 text-xs font-bold text-mq-primary">{m.dailyCount} câu / ngày</p>
                </div>
              ))}
            </div>
          </main>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <AppShell activeNav="modules">
        <main className="flex flex-1 flex-col px-4 py-5">
          <div className="mb-4">
            <ProfileBadge />
          </div>
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">{config.title}</h1>
          <p className="mb-4 text-sm text-mq-muted">
            Chọn chủ đề để tạo đề ôn {DAILY_QUESTION_COUNT} câu/ngày. Đang chọn{" "}
            <strong>{activeIds.size}</strong>/{config.allIds.length} chủ đề.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-mq-muted"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-mq-muted"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              onClick={applySelection}
              disabled={activeIds.size === 0}
              className="rounded-lg bg-mq-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
            >
              Áp dụng & tạo đề mới
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {config.curriculum.map((chapter) => (
              <div key={chapter.id} className="rounded-mq-sm bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((e) => ({ ...e, [chapter.id]: !e[chapter.id] }))
                  }
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="font-extrabold">
                    {chapter.icon} {chapter.label}
                  </span>
                  <span className="text-xs font-bold text-mq-muted">
                    {chapter.topics.filter((t) => isSelected(t.id)).length}/{chapter.topics.length}{" "}
                    {expanded[chapter.id] ? "▲" : "▼"}
                  </span>
                </button>
                {expanded[chapter.id] && (
                  <div className="border-t border-slate-100 px-3 pb-3">
                    {chapter.topics.map((topic) => (
                      <label
                        key={topic.id}
                        className="mt-2 flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected(topic.id)}
                          onChange={() => toggleTopic(topic.id)}
                          className="mt-1 h-4 w-4 accent-mq-primary"
                        />
                        <div>
                          <div className="text-sm font-bold">{topic.label}</div>
                          <div className="text-xs text-mq-muted">{topic.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </AppShell>
    </div>
  );
}
