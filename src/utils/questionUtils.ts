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

export function mcqNumber(
  answer: number,
  spread = 10
): { options: string[]; answer: string } {
  return {
    answer: String(answer),
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-spread, spread))),
  };
}

export function mcqString(answer: string, distractors: string[]): { options: string[]; answer: string } {
  return { answer, options: shuffle([answer, ...distractors.slice(0, 3)]) };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}
