import type { MathEvent } from "@/store/appStore";

export interface SessionReview {
  sessionId: string;
  startedAt: string;
  events: MathEvent[];
  correct: number;
  total: number;
}

export function groupEventsBySession(events: MathEvent[]): SessionReview[] {
  const map = new Map<string, MathEvent[]>();
  for (const event of events) {
    const list = map.get(event.sessionId) ?? [];
    list.push(event);
    map.set(event.sessionId, list);
  }

  return [...map.entries()]
    .map(([sessionId, sessionEvents]) => ({
      sessionId,
      startedAt: sessionEvents[0]?.timestamp ?? "",
      events: sessionEvents,
      correct: sessionEvents.filter((e) => e.correct).length,
      total: sessionEvents.length,
    }))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function formatSessionTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Hôm nay lúc ${time}`;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
