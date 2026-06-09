"use client";

import { AppShell } from "@/components/ui/AppShell";
import { ProfileBadge } from "@/components/ui/ProfileBadge";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { getModulesForGrade } from "@/types/curriculum";

export default function ModulesPage() {
  const profile = useActiveProfile();
  const modules = getModulesForGrade(profile.grade);

  return (
    <div className="page-wrap">
      <AppShell activeNav="modules">
        <main className="flex flex-1 flex-col px-4 py-5">
          <div className="mb-4">
            <ProfileBadge />
          </div>
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Chủ đề lớp {profile.grade}</h1>
          <p className="mb-5 text-sm text-mq-muted">
            Mỗi ngày hệ thống tạo {modules.reduce((s, m) => s + m.dailyCount, 0)} câu từ các module
            trọng tâm sau:
          </p>

          <div className="flex flex-col gap-3">
            {modules.map((m) => (
              <div key={m.id} className="rounded-mq-sm bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl">{m.icon}</span>
                  <h3 className="font-extrabold">{m.label}</h3>
                </div>
                <p className="text-sm text-mq-muted">{m.description}</p>
                <p className="mt-2 text-xs font-bold text-mq-primary">
                  {m.dailyCount} câu / ngày trong đề ôn
                </p>
              </div>
            ))}
          </div>
        </main>
      </AppShell>
    </div>
  );
}
