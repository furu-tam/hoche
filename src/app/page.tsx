"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { getPathRecommendation } from "@/services/learningPath";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { dailyTotalProgress, useAppStore } from "@/store/appStore";
import {
  DAILY_QUESTION_COUNT,
  getModulesForGrade,
  GRADE1_CURRICULUM,
  GRADE5_CURRICULUM,
  isTopicBasedGrade,
  type Grade,
} from "@/types/curriculum";
import { prefetchQuestionGenerator } from "@/services/examQuestions";
import { ALL_GRADE1_TOPIC_IDS } from "@/types/grade1Curriculum";
import { ALL_GRADE5_TOPIC_IDS } from "@/types/grade5Curriculum";

export default function HomePage() {
  const profile = useActiveProfile();
  const resetDailyIfNewDay = useAppStore((s) => s.resetDailyIfNewDay);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const setStudentGrade = useAppStore((s) => s.setStudentGrade);
  const profiles = useAppStore((s) => s.profiles);

  useEffect(() => {
    resetDailyIfNewDay();
  }, [resetDailyIfNewDay]);

  useEffect(() => {
    prefetchQuestionGenerator(profile.grade);
  }, [profile.grade]);

  const { xp, coins, level, streak, dailyProgress, dailyComplete } = profile;
  const done = dailyTotalProgress(dailyProgress);
  const pct = Math.round((done / DAILY_QUESTION_COUNT) * 100);
  const allDone = dailyComplete || done >= DAILY_QUESTION_COUNT;
  const recommendation = getPathRecommendation(profile);
  const modules = getModulesForGrade(profile.grade);
  const topicCurriculum =
    profile.grade === 1 ? GRADE1_CURRICULUM : profile.grade === 5 ? GRADE5_CURRICULUM : null;
  const topicCount =
    profile.grade === 1
      ? (profile.selectedGrade1Topics?.length ?? ALL_GRADE1_TOPIC_IDS.length)
      : profile.grade === 5
        ? (profile.selectedGrade5Topics?.length ?? ALL_GRADE5_TOPIC_IDS.length)
        : 0;

  return (
    <div className="page-wrap">
      <AppShell activeNav="home">
        <main className="flex flex-1 flex-col px-4 py-5">
          <header className="mb-5 text-center">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold text-mq-primary">
              <span>📐</span> Học Hè
            </h1>
            <p className="mt-1 text-sm text-mq-muted">10 câu Toán mỗi ngày — ôn luyện theo lớp</p>
          </header>

          <div className="mb-4 rounded-mq-sm bg-white p-3 shadow-sm">
            <label className="mb-1 block text-xs font-bold text-mq-muted">Học sinh · Lớp</label>
            <select
              value={profile.id}
              onChange={(e) => setActiveProfile(e.target.value)}
              className="w-full rounded-mq-sm border border-slate-200 px-3 py-2 font-bold"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name} — Lớp {p.grade}
                </option>
              ))}
            </select>
            <div className="mt-2 flex gap-1">
              {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setStudentGrade(profile.id, g)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                    profile.grade === g ? "bg-mq-primary text-white" : "bg-slate-100 text-mq-muted"
                  }`}
                >
                  L{g}
                </button>
              ))}
            </div>
            <Link href="/profiles" className="mt-2 block text-center text-xs font-bold text-mq-primary">
              Quản lý hồ sơ →
            </Link>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: "Level", value: level },
              { label: "XP", value: xp },
              { label: "Coins", value: coins },
            ].map((s) => (
              <div key={s.label} className="rounded-mq-sm bg-white py-3 text-center shadow-sm">
                <div className="text-[0.65rem] font-bold uppercase tracking-wide text-mq-muted">
                  {s.label}
                </div>
                <div className="text-xl font-extrabold text-mq-primary">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 rounded-mq bg-gradient-to-r from-mq-accent to-amber-300 py-3.5 font-extrabold text-white">
            <span className="text-2xl">🔥</span>
            <span>{streak} ngày liên tiếp!</span>
          </div>

          <div className="mb-4 rounded-mq-sm bg-blue-50 px-3 py-2 text-sm font-semibold text-mq-primary">
            🎯 {recommendation}
          </div>

          <div className="mb-5">
            <div className="mb-2 flex justify-between text-sm font-bold">
              <span>Đề ôn hôm nay</span>
              <span>
                {done}/{DAILY_QUESTION_COUNT}
              </span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-mq-success transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {isTopicBasedGrade(profile.grade) && topicCurriculum ? (
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-extrabold">Chủ đề đang ôn</h2>
                <Link href="/modules" className="text-xs font-bold text-mq-primary">
                  Chọn chủ đề →
                </Link>
              </div>
              <p className="mb-3 text-xs text-mq-muted">
                {topicCount} chủ đề · {topicCurriculum.length} chương
              </p>
              <div className="flex flex-col gap-2">
                {topicCurriculum.map((ch) => (
                  <div key={ch.id} className="rounded-mq-sm bg-white p-3 shadow-sm">
                    <span className="text-sm font-extrabold">
                      {ch.icon} {ch.label}
                    </span>
                    <p className="text-xs text-mq-muted">{ch.topics.length} chủ đề con</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-5 flex flex-col gap-2">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-mq-sm bg-white p-3 shadow-sm"
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <h3 className="text-sm font-extrabold">{m.label}</h3>
                    <p className="text-xs text-mq-muted">
                      {dailyProgress[m.id] ?? 0}/{m.dailyCount} câu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            {allDone ? (
              <div className="rounded-mq bg-green-100 py-4 text-center font-extrabold text-mq-success">
                ✅ Đã hoàn thành đề hôm nay! ({done}/{DAILY_QUESTION_COUNT})
              </div>
            ) : (
              <>
                {profile.grade === 1 && (
                  <p className="mb-2 text-center text-xs font-bold text-mq-primary">
                    🔊 Lớp 1 đọc câu hỏi bằng giọng nói — bấm icon loa góc phải để nghe lại
                  </p>
                )}
                <Link
                  href="/play"
                  className="flex min-h-[72px] items-center justify-center rounded-mq bg-gradient-to-br from-mq-primary to-sky-400 text-xl font-extrabold text-white active:scale-[0.97]"
                >
                  ▶ LÀM BÀI HÔM NAY ({done}/{DAILY_QUESTION_COUNT})
                </Link>
              </>
            )}
          </div>
        </main>
      </AppShell>
    </div>
  );
}
