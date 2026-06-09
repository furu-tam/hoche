"use client";

import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { useAppStore } from "@/store/appStore";

export default function RewardPage() {
  const bonus = useAppStore((s) => s.lastSessionBonus);

  return (
    <div className="page-wrap">
      <AppShell showNav={false}>
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h1 className="mb-2 text-2xl font-extrabold text-mq-primary">Hoàn thành đề Toán!</h1>
          <p className="mb-6 text-mq-muted">10 câu ôn luyện hôm nay đã xong.</p>
          {bonus && (
            <div className="mb-8 flex gap-4">
              <div className="rounded-mq-sm bg-white px-5 py-3 shadow-sm">
                <div className="text-sm text-mq-muted">Bonus XP</div>
                <div className="text-xl font-extrabold text-mq-primary">+{bonus.xp}</div>
              </div>
              <div className="rounded-mq-sm bg-white px-5 py-3 shadow-sm">
                <div className="text-sm text-mq-muted">Coins</div>
                <div className="text-xl font-extrabold text-mq-accent">+{bonus.coins}</div>
              </div>
            </div>
          )}
          <Link
            href="/"
            className="flex min-h-[60px] w-full max-w-xs items-center justify-center rounded-mq bg-mq-primary font-extrabold text-white"
          >
            Về trang chủ
          </Link>
        </main>
      </AppShell>
    </div>
  );
}
