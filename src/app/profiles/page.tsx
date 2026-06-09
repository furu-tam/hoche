"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { useAppStore } from "@/store/appStore";
import type { Grade } from "@/types/curriculum";

const AVATARS = ["🎒", "👧", "👦", "🧑‍🎓", "📚", "⭐"];

export default function ProfilesPage() {
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const setActive = useAppStore((s) => s.setActiveProfile);
  const addProfile = useAppStore((s) => s.addProfile);
  const removeProfile = useAppStore((s) => s.removeProfile);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>(3);
  const [avatar, setAvatar] = useState("🎒");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    addProfile(name.trim(), grade, avatar);
    setName("");
    setGrade(3);
    setShowForm(false);
  };

  return (
    <div className="page-wrap">
      <AppShell showNav={false}>
        <main className="flex flex-1 flex-col px-4 py-5">
          <Link href="/" className="mb-4 text-2xl">
            ←
          </Link>
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Hồ sơ học sinh</h1>
          <p className="mb-5 text-sm text-mq-muted">Chọn lớp để nhận đề ôn phù hợp</p>

          <div className="mb-5 flex flex-col gap-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-mq-sm bg-white p-4 shadow-sm ${
                  p.id === activeId ? "ring-2 ring-mq-primary" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActive(p.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="text-3xl">{p.avatar}</span>
                  <div>
                    <div className="font-extrabold">{p.name}</div>
                    <div className="text-sm text-mq-muted">
                      Lớp {p.grade} · Level {p.level}
                    </div>
                  </div>
                </button>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProfile(p.id)}
                    className="ml-2 text-sm text-mq-danger"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>

          {showForm ? (
            <div className="rounded-mq bg-white p-4 shadow-mq">
              <label className="mb-2 block text-sm font-bold">Tên học sinh</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full rounded-mq-sm border border-slate-200 px-3 py-3 text-lg"
                placeholder="VD: Nguyễn An"
              />
              <label className="mb-2 block text-sm font-bold">Lớp: {grade}</label>
              <input
                type="range"
                min={1}
                max={5}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                className="mb-3 w-full"
              />
              <div className="mb-3 flex justify-between text-xs text-mq-muted">
                <span>Lớp 1</span>
                <span>Lớp 5</span>
              </div>
              <label className="mb-2 block text-sm font-bold">Avatar</label>
              <div className="mb-4 flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`rounded-lg p-2 text-2xl ${avatar === a ? "bg-blue-100 ring-2 ring-mq-primary" : "bg-slate-50"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-mq bg-mq-primary py-3 font-extrabold text-white"
              >
                Tạo hồ sơ
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-mq border-2 border-dashed border-mq-primary py-4 font-bold text-mq-primary"
            >
              + Thêm học sinh mới
            </button>
          )}
        </main>
      </AppShell>
    </div>
  );
}
