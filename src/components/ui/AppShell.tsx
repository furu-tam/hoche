import Link from "next/link";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  activeNav?: "home" | "dashboard" | "parent" | "modules" | "dictionary";
}

export function AppShell({ children, showNav = true, activeNav = "home" }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] bg-mq-bg shadow-mq phone-frame">
      {children}
      {showNav && (
        <nav className="flex justify-around border-t border-black/5 bg-white px-0.5 py-2.5">
          <Link
            href="/"
            className={`flex min-w-10 flex-col items-center gap-0.5 text-[0.58rem] font-bold ${activeNav === "home" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-lg">🏠</span>
            Nhà
          </Link>
          <Link
            href="/modules"
            className={`flex min-w-10 flex-col items-center gap-0.5 text-[0.58rem] font-bold ${activeNav === "modules" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-lg">📚</span>
            Chủ đề
          </Link>
          <Link
            href="/dictionary"
            className={`flex min-w-10 flex-col items-center gap-0.5 text-[0.58rem] font-bold ${activeNav === "dictionary" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-lg">📖</span>
            Anh
          </Link>
          <Link
            href="/dashboard"
            className={`flex min-w-10 flex-col items-center gap-0.5 text-[0.58rem] font-bold ${activeNav === "dashboard" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-lg">📊</span>
            Tiến độ
          </Link>
          <Link
            href="/parent"
            className={`flex min-w-10 flex-col items-center gap-0.5 text-[0.58rem] font-bold ${activeNav === "parent" ? "text-mq-primary" : "text-mq-muted"}`}
          >
            <span className="text-lg">👨‍👩‍👧</span>
            PH
          </Link>
        </nav>
      )}
    </div>
  );
}
