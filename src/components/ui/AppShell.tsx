import Link from "next/link";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  activeNav?: "home" | "dashboard" | "parent" | "modules";
}

export function AppShell({ children, showNav = true, activeNav = "home" }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] bg-mq-bg shadow-mq phone-frame">
      {children}
      {showNav && (
        <nav className="flex justify-around border-t border-black/5 bg-white px-1 py-3">
          <Link
            href="/"
            className={`flex min-w-12 flex-col items-center gap-1 text-[0.65rem] font-bold ${activeNav === "home" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-xl">🏠</span>
            Nhà
          </Link>
          <Link
            href="/modules"
            className={`flex min-w-12 flex-col items-center gap-1 text-[0.65rem] font-bold ${activeNav === "modules" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-xl">📚</span>
            Chủ đề
          </Link>
          <Link
            href="/dashboard"
            className={`flex min-w-12 flex-col items-center gap-1 text-[0.65rem] font-bold ${activeNav === "dashboard" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-xl">📊</span>
            Tiến độ
          </Link>
          <Link
            href="/parent"
            className={`flex min-w-12 flex-col items-center gap-1 text-[0.65rem] font-bold ${activeNav === "parent" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-xl">👨‍👩‍👧</span>
            Phụ huynh
          </Link>
        </nav>
      )}
    </div>
  );
}
