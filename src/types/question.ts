import type { MathModule } from "./curriculum";

export type Difficulty = 1 | 2 | 3;

export interface MathQuestion {
  type: "math";
  module: MathModule;
  topicId?: string;
  topicLabel?: string;
  difficulty: Difficulty;
  promptText: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: "Dễ",
  2: "Trung bình",
  3: "Khó",
};
