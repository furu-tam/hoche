"use client";

import { AppShell } from "@/components/ui/AppShell";
import { ProfileBadge } from "@/components/ui/ProfileBadge";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { computeModuleScores } from "@/utils/skillStats";
import { getModulesForGrade, GRADE5_CURRICULUM, MODULE_LABELS } from "@/types/curriculum";

export default function DashboardPage() {
  const profile = useActiveProfile();
  const scores = computeModuleScores(profile.events);
  const modules = getModulesForGrade(profile.grade);
  const total = profile.events.length;
  const correct = profile.events.filter((e) => e.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="page-wrap">
      <AppShell activeNav="dashboard">
        <main className="flex flex-1 flex-col px-4 py-5">
          <div className="mb-4">
            <ProfileBadge />
          </div>
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Tiến độ học tập</h1>
          <p className="mb-5 text-sm text-mq-muted">
            Lớp {profile.grade} · {profile.name}
          </p>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-mq-sm bg-white p-4 text-center shadow-sm">
              <div className="text-sm text-mq-muted">Độ chính xác</div>
              <div className="text-2xl font-extrabold text-mq-primary">{accuracy}%</div>
            </div>
            <div className="rounded-mq-sm bg-white p-4 text-center shadow-sm">
              <div className="text-sm text-mq-muted">Tổng câu đã làm</div>
              <div className="text-2xl font-extrabold text-mq-primary">{total}</div>
            </div>
          </div>

          <h2 className="mb-3 font-extrabold">Theo chủ đề</h2>
          <div className="flex flex-col gap-3">
            {profile.grade === 5
              ? GRADE5_CURRICULUM.map((chapter) => {
                  const chapterScores = chapter.topics.map((t) => scores[t.id] ?? { total: 0, correct: 0, accuracy: 0 });
                  const chTotal = chapterScores.reduce((s, x) => s + x.total, 0);
                  const chCorrect = chapterScores.reduce((s, x) => s + x.correct, 0);
                  const chAcc = chTotal > 0 ? Math.round((chCorrect / chTotal) * 100) : 0;
                  return (
                    <div key={chapter.id} className="rounded-mq-sm bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-extrabold">
                          {chapter.icon} {chapter.label}
                        </span>
                        <span className="text-sm font-bold text-mq-muted">{chAcc}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-mq-primary transition-all"
                          style={{ width: `${chAcc}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-mq-muted">
                        {chCorrect}/{chTotal} câu đúng · {chapter.topics.length} chủ đề
                      </p>
                    </div>
                  );
                })
              : modules.map((m) => {
                  const s = scores[m.id] ?? { total: 0, correct: 0, accuracy: 0 };
                  return (
                    <div key={m.id} className="rounded-mq-sm bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-extrabold">
                          {m.icon} {MODULE_LABELS[m.id]}
                        </span>
                        <span className="text-sm font-bold text-mq-muted">{s.accuracy}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-mq-primary transition-all"
                          style={{ width: `${s.accuracy}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-mq-muted">
                        {s.correct}/{s.total} câu đúng
                      </p>
                    </div>
                  );
                })}
          </div>
        </main>
      </AppShell>
    </div>
  );
}
