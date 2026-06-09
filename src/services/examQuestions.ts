import type { PathStep } from "@/services/learningPath";
import { generateGrade1Question } from "@/services/grade1QuestionGenerator";
import { generateGrade5Question } from "@/services/grade5QuestionGenerator";
import { generateMathQuestion } from "@/services/questionGenerator";
import type { Grade, MathModule } from "@/types/curriculum";
import type { Grade1TopicId } from "@/types/grade1Curriculum";
import type { Grade5TopicId } from "@/types/grade5Curriculum";
import type { Difficulty, MathQuestion } from "@/types/question";
import { initialDifficultyForGrade } from "@/utils/adaptiveDifficulty";

/** Prefetch chunk generator — gọi từ trang chủ để /play mở nhanh hơn */
export function prefetchQuestionGenerator(grade: Grade): void {
  if (grade === 1) void import("@/services/grade1QuestionGenerator");
  else if (grade === 5) void import("@/services/grade5QuestionGenerator");
  else void import("@/services/questionGenerator");
}

export function generateQuestion(
  topicId: string,
  difficulty: Difficulty,
  grade: Grade
): MathQuestion {
  if (grade === 1 && topicId.startsWith("g1_")) {
    return generateGrade1Question(topicId as Grade1TopicId, difficulty);
  }
  if (grade === 5 && topicId.startsWith("g5_")) {
    return generateGrade5Question(topicId as Grade5TopicId, difficulty);
  }
  return generateMathQuestion(topicId as MathModule, difficulty, grade);
}

/** Tạo đồng loạt cả đề — tránh delay từng câu trên UI */
export function generateExamQuestions(
  path: PathStep[],
  grade: Grade,
  moduleDifficulty: Partial<Record<string, Difficulty>>
): MathQuestion[] {
  const fallback = initialDifficultyForGrade(grade);
  return path.map((step) =>
    generateQuestion(step.topicId, moduleDifficulty[step.topicId] ?? fallback, grade)
  );
}
