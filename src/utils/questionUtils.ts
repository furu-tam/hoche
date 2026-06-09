export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildMcq(answer: number | string, distractors: (number | string)[]): string[] {
  return shuffle([String(answer), ...distractors.map(String)]);
}

export function uniqueDistractors(
  answer: number,
  count: number,
  maker: (i: number) => number
): string[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < count && guard < 50) {
    const v = maker(guard);
    if (v !== answer && v >= 0) set.add(v);
    guard++;
  }
  return [...set].map(String);
}

function fastDistractors(answer: number, spread: number, count = 3): number[] {
  const deltas = [spread, -spread, spread * 2, -spread * 2, 1, -1, 2, -2, 5, -5];
  const result: number[] = [];
  for (const d of deltas) {
    const v = answer + d;
    if (v !== answer && v >= 0 && !result.includes(v)) result.push(v);
    if (result.length >= count) break;
  }
  let n = 1;
  while (result.length < count && n < 100) {
    const v = answer + spread + n;
    if (v !== answer && !result.includes(v)) result.push(v);
    n++;
  }
  return result.slice(0, count);
}

export function mcqNumber(
  answer: number,
  spread = 10
): { options: string[]; answer: string } {
  const distractors =
    spread > 50
      ? fastDistractors(answer, spread).map(String)
      : uniqueDistractors(answer, 3, () => answer + randInt(-spread, spread));
  return {
    answer: String(answer),
    options: buildMcq(answer, distractors),
  };
}

export function mcqString(answer: string, distractors: string[]): { options: string[]; answer: string } {
  return { answer, options: shuffle([answer, ...distractors.slice(0, 3)]) };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}
