"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { ProfileBadge } from "@/components/ui/ProfileBadge";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import {
  ALL_GRADE5_TOPIC_IDS,
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  GRADE5_CURRICULUM,
  type Grade5TopicId,
} from "@/types/curriculum";
import { useAppStore } from "@/store/appStore";

export default function ModulesPage() {
  const profile = useActiveProfile();
  const modules = getModulesForGrade(profile.grade);
  const toggleGrade5Topic = useAppStore((s) => s.toggleGrade5Topic);
  const setSelectedGrade5Topics = useAppStore((s) => s.setSelectedGrade5Topics);
  const resetTodayExam = useAppStore((s) => s.resetTodayExam);

  const selected = profile.selectedGrade5Topics;
  const activeIds = useMemo(() => {
    if (selected === null) return new Set(ALL_GRADE5_TOPIC_IDS);
    return new Set(selected);
  }, [selected]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GRADE5_CURRICULUM.map((c) => [c.id, true]))
  );

  const isSelected = (id: Grade5TopicId) => activeIds.has(id);

  const applySelection = () => {
    const ids = [...activeIds] as Grade5TopicId[];
    setSelectedGrade5Topics(ids.length === ALL_GRADE5_TOPIC_IDS.length ? null : ids);
    resetTodayExam();
  };

  if (profile.grade !== 5) {
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
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Chương trình lớp 5</h1>
          <p className="mb-4 text-sm text-mq-muted">
            Chọn chủ đề để tạo đề ôn {DAILY_QUESTION_COUNT} câu/ngày. Đang chọn{" "}
            <strong>{activeIds.size}</strong>/{ALL_GRADE5_TOPIC_IDS.length} chủ đề.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedGrade5Topics(null)}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-mq-muted"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedGrade5Topics([])}
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
            {GRADE5_CURRICULUM.map((chapter) => (
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
                          onChange={() => toggleGrade5Topic(topic.id)}
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
