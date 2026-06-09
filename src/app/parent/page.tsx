"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { useAppStore } from "@/store/appStore";
import { computeModuleScores } from "@/utils/skillStats";
import { formatSessionTime, groupEventsBySession } from "@/utils/sessionReview";
import {
  getModulesForGrade,
  getTopicLabel,
  GRADE1_CURRICULUM,
  GRADE5_CURRICULUM,
  isTopicBasedGrade,
  MODULE_LABELS,
} from "@/types/curriculum";

type ParentTab = "report" | "review";

export default function ParentPage() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const verifyPin = useAppStore((s) => s.verifyParentPin);
  const setParentPin = useAppStore((s) => s.setParentPin);

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [tab, setTab] = useState<ParentTab>("report");
  const [selectedId, setSelectedId] = useState(activeProfileId);

  const selected = profiles.find((p) => p.id === selectedId) ?? profiles[0];
  const sessions = useMemo(
    () => (selected ? groupEventsBySession(selected.events) : []),
    [selected]
  );

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

  if (!selected) {
    return null;
  }

  const scores = computeModuleScores(selected.events);
  const modules = getModulesForGrade(selected.grade);
  const total = selected.events.length;
  const acc =
    total > 0 ? Math.round((selected.events.filter((e) => e.correct).length / total) * 100) : 0;

  return (
    <div className="page-wrap">
      <AppShell activeNav="parent">
        <main className="flex flex-1 flex-col px-4 py-5">
          <h1 className="mb-4 text-2xl font-extrabold text-mq-primary">Báo cáo phụ huynh</h1>

          <div className="mb-4 rounded-mq-sm bg-white p-3 shadow-sm">
            <label className="mb-1 block text-xs font-bold text-mq-muted">Học sinh</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-mq-sm border border-slate-200 px-3 py-2 font-bold"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name} — Lớp {p.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex gap-2">
            {(
              [
                { id: "report" as const, label: "Tổng quan" },
                { id: "review" as const, label: "Review" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-extrabold ${
                  tab === t.id ? "bg-mq-primary text-white" : "bg-slate-100 text-mq-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "report" ? (
            <>
              <div className="mb-4 rounded-mq-sm bg-white p-4 shadow-sm">
                <h2 className="mb-1 font-extrabold">
                  {selected.avatar} {selected.name} — Lớp {selected.grade}
                </h2>
                <p className="mb-2 text-sm text-mq-muted">
                  Streak {selected.streak} ngày · Độ chính xác {acc}% · {selected.dailyCompleteCount}{" "}
                  đề hoàn thành
                </p>
                <ul className="text-sm">
                  {isTopicBasedGrade(selected.grade)
                    ? (selected.grade === 1 ? GRADE1_CURRICULUM : GRADE5_CURRICULUM).map((ch) => {
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

              <div className="rounded-mq-sm bg-slate-50 p-4">
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
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {sessions.length === 0 ? (
                <div className="rounded-mq-sm bg-white p-6 text-center text-sm text-mq-muted shadow-sm">
                  {selected.name} chưa có bài làm nào để xem lại.
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.sessionId} className="rounded-mq-sm bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-mq-primary">
                        {formatSessionTime(session.startedAt)}
                      </h3>
                      <span className="text-sm font-bold text-mq-muted">
                        {session.correct}/{session.total} đúng
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {session.events.map((event, index) => {
                        const topic =
                          event.topicLabel ??
                          getTopicLabel(String(event.module), selected.grade);
                        const hasDetail = Boolean(event.promptText);

                        return (
                          <div
                            key={`${event.sessionId}-${index}`}
                            className={`rounded-lg border p-3 ${
                              event.correct
                                ? "border-green-200 bg-green-50/50"
                                : "border-red-200 bg-red-50/50"
                            }`}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-mq-muted">
                                Câu {index + 1} · {topic}
                              </span>
                              <span
                                className={`text-xs font-extrabold ${
                                  event.correct ? "text-mq-success" : "text-mq-danger"
                                }`}
                              >
                                {event.correct ? "Đúng" : "Sai"}
                              </span>
                            </div>

                            {hasDetail ? (
                              <>
                                <p className="mb-2 text-sm font-extrabold leading-relaxed">
                                  {event.promptText}
                                </p>
                                {event.options && event.options.length > 0 && (
                                  <p className="mb-2 text-xs text-mq-muted">
                                    Lựa chọn: {event.options.join(" · ")}
                                  </p>
                                )}
                                <p className="text-sm">
                                  <span className="font-bold">Con chọn:</span>{" "}
                                  <span
                                    className={
                                      event.correct ? "text-mq-success" : "text-mq-danger"
                                    }
                                  >
                                    {event.studentAnswer ?? "—"}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-bold">Đáp án đúng:</span> {event.answer}
                                </p>
                                {event.explanation && (
                                  <p className="mt-1 text-xs text-mq-muted">
                                    💡 {event.explanation}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-mq-muted">
                                Bài làm cũ — không lưu nội dung câu hỏi. Chỉ biết{" "}
                                {event.correct ? "đúng" : "sai"} ({topic}).
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </AppShell>
    </div>
  );
}
