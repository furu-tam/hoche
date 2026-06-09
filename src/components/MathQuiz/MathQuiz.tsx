"use client";

import { useEffect, useState } from "react";
import type { MathQuestion } from "@/types/question";
import { DIFFICULTY_LABEL } from "@/types/question";
import { MODULE_LABELS } from "@/types/curriculum";

interface MathQuizProps {
  question: MathQuestion;
  questionLabel: string;
  onAnswer: (correct: boolean, responseTime: number) => void;
}

export function MathQuiz({ question, questionLabel, onAnswer }: MathQuizProps) {
  const [start, setStart] = useState(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setStart(Date.now());
    setPicked(null);
  }, [question.promptText, question.answer]);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt === question.answer;
    onAnswer(correct, (Date.now() - start) / 1000);
  };

  return (
    <div className="flex flex-1 flex-col">
      <p className="text-center text-sm font-bold text-mq-primary">
        {MODULE_LABELS[question.module]}
      </p>
      <p className="mb-5 text-center text-sm text-mq-muted">
        {questionLabel} · {DIFFICULTY_LABEL[question.difficulty]}
      </p>

      <div className="mb-6 rounded-mq bg-white p-6 text-center shadow-mq">
        <p className="text-2xl font-extrabold leading-relaxed">{question.promptText}</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => choose(opt)}
            className={`min-h-[64px] rounded-mq-sm bg-white text-xl font-extrabold shadow-sm transition ${
              picked === opt
                ? opt === question.answer
                  ? "ring-2 ring-mq-success bg-green-50"
                  : "ring-2 ring-mq-danger bg-red-50"
                : "hover:ring-2 hover:ring-mq-primary/30"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {picked && (
        <p className="mt-4 text-center text-sm font-semibold text-mq-muted">
          {picked === question.answer ? "✅ Chính xác! " : "💡 Gợi ý: "}
          {question.explanation}
        </p>
      )}
    </div>
  );
}
