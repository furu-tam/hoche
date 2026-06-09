"use client";

import { useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { useAppStore } from "@/store/appStore";
import { computeModuleScores } from "@/utils/skillStats";
import {
  getModulesForGrade,
  GRADE1_CURRICULUM,
  GRADE5_CURRICULUM,
  isTopicBasedGrade,
  MODULE_LABELS,
} from "@/types/curriculum";

export default function ParentPage() {
  const profiles = useAppStore((s) => s.profiles);
  const verifyPin = useAppStore((s) => s.verifyParentPin);
  const setParentPin = useAppStore((s) => s.setParentPin);

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [newPin, setNewPin] = useState("");

  const tryUnlock = () => {
    if (verifyPin(pin)) setUnlocked(true);
    else alert("PIN không đúng (mặc định: 1234)");
  };

  if (!unlocked) {
    return (
      <div className="page-wrap">
        <AppShell activeNav="parent">
          <main className="flex flex-1 flex-col px-4 py-8">
            <h1 className="mb-2 text-2xl font-extrabold text-mq-primary">Khu vực phụ huynh</h1>
            <p className="mb-5 text-sm text-mq-muted">Nhập PIN để xem báo cáo</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mb-3 rounded-mq-sm border border-slate-200 px-4 py-3 text-lg"
              placeholder="PIN"
            />
            <button
              type="button"
              onClick={tryUnlock}
              className="rounded-mq bg-mq-primary py-3 font-extrabold text-white"
            >
              Mở khóa
            </button>
          </main>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <AppShell activeNav="parent">
        <main className="flex flex-1 flex-col px-4 py-5">
          <h1 className="mb-4 text-2xl font-extrabold text-mq-primary">Báo cáo phụ huynh</h1>

          {profiles.map((p) => {
            const scores = computeModuleScores(p.events);
            const modules = getModulesForGrade(p.grade);
            const total = p.events.length;
            const acc =
              total > 0
                ? Math.round((p.events.filter((e) => e.correct).length / total) * 100)
                : 0;

            return (
              <div key={p.id} className="mb-4 rounded-mq-sm bg-white p-4 shadow-sm">
                <h2 className="mb-1 font-extrabold">
                  {p.avatar} {p.name} — Lớp {p.grade}
                </h2>
                <p className="mb-2 text-sm text-mq-muted">
                  Streak {p.streak} ngày · Độ chính xác {acc}% · {p.dailyCompleteCount} đề hoàn thành
                </p>
                <ul className="text-sm">
                  {isTopicBasedGrade(p.grade)
                    ? (p.grade === 1 ? GRADE1_CURRICULUM : GRADE5_CURRICULUM).map((ch) => {
                        const chTotal = ch.topics.reduce(
                          (sum, t) => sum + (scores[t.id]?.total ?? 0),
                          0
                        );
                        const chAcc =
                          chTotal > 0
                            ? Math.round(
                                (ch.topics.reduce(
                                  (sum, t) => sum + (scores[t.id]?.correct ?? 0),
                                  0
                                ) /
                                  chTotal) *
                                  100
                              )
                            : 0;
                        return (
                          <li key={ch.id} className="text-mq-muted">
                            {ch.label}: {chAcc}% ({chTotal} câu)
                          </li>
                        );
                      })
                    : modules.map((m) => {
                        const s = scores[m.id];
                        return (
                          <li key={m.id} className="text-mq-muted">
                            {MODULE_LABELS[m.id]}: {s?.accuracy ?? 0}% ({s?.total ?? 0} câu)
                          </li>
                        );
                      })}
                </ul>
              </div>
            );
          })}

          <div className="mt-4 rounded-mq-sm bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-bold">Đổi PIN mới</label>
            <input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="mb-2 w-full rounded-mq-sm border px-3 py-2"
            />
            <button
              type="button"
              onClick={() => {
                if (newPin.length >= 4) {
                  setParentPin(newPin);
                  setNewPin("");
                  alert("Đã đổi PIN");
                }
              }}
              className="text-sm font-bold text-mq-primary"
            >
              Lưu PIN
            </button>
          </div>
        </main>
      </AppShell>
    </div>
  );
}
