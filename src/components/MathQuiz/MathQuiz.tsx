"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import type { MathQuestion } from "@/types/question";
import { DIFFICULTY_LABEL } from "@/types/question";
import { MODULE_LABELS } from "@/types/curriculum";

interface MathQuizProps {
  question: MathQuestion;
  questionLabel: string;
  voiceEnabled?: boolean;
  onAnswer: (correct: boolean, responseTime: number) => void;
}

export function MathQuiz({
  question,
  questionLabel,
  voiceEnabled = false,
  onAnswer,
}: MathQuizProps) {
  const [start, setStart] = useState(() => Date.now());
  const [picked, setPicked] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const answeredRef = useRef(false);
  const { supported, readQuestion, readOption, readFeedback, cancel } =
    useSpeech(voiceEnabled);

  useEffect(() => {
    setStart(Date.now());
    setPicked(null);
    answeredRef.current = false;
    cancel();

    if (!voiceEnabled || !supported) return;

    let cancelled = false;
    setSpeaking(true);
    readQuestion(question.promptText).finally(() => {
      if (!cancelled) setSpeaking(false);
    });

    return () => {
      cancelled = true;
      cancel();
    };
  }, [question.promptText, question.answer, voiceEnabled, supported, readQuestion, cancel]);

  const choose = async (opt: string) => {
    if (picked || answeredRef.current) return;
    answeredRef.current = true;
    setPicked(opt);
    cancel();
    const correct = opt === question.answer;

    if (voiceEnabled && supported) {
      setSpeaking(true);
      await readFeedback(correct, question.explanation);
      setSpeaking(false);
    }

    onAnswer(correct, (Date.now() - start) / 1000);
  };

  const handleReadOption = async (opt: string) => {
    if (picked) return;
    cancel();
    setSpeaking(true);
    await readOption(opt);
    setSpeaking(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {voiceEnabled && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-mq-sm bg-sky-50 px-3 py-2 text-xs font-bold text-mq-primary">
          <span>🔊</span>
          <span>{speaking ? "Đang đọc..." : supported ? "Chế độ nghe cho lớp 1" : "Trình duyệt không hỗ trợ đọc"}</span>
        </div>
      )}

      {!voiceEnabled && (
        <>
          <p className="text-center text-sm font-bold text-mq-primary">
            {question.topicLabel ?? MODULE_LABELS[question.module]}
          </p>
          <p className="mb-5 text-center text-sm text-mq-muted">
            {questionLabel} · {DIFFICULTY_LABEL[question.difficulty]}
          </p>
        </>
      )}

      {voiceEnabled && (
        <p className="mb-3 text-center text-xs font-bold text-mq-muted">{questionLabel}</p>
      )}

      <div className="mb-4 flex flex-col gap-3">
        <div className="rounded-mq bg-white p-6 text-center shadow-mq">
          <p className={`font-extrabold leading-relaxed ${voiceEnabled ? "text-3xl" : "text-2xl"}`}>
            {question.promptText}
          </p>
        </div>
        {voiceEnabled && supported && (
          <SpeakButton
            size="lg"
            label="Nghe lại câu hỏi"
            className="w-full"
            onClick={() => {
              cancel();
              setSpeaking(true);
              readQuestion(question.promptText).finally(() => setSpeaking(false));
            }}
          />
        )}
      </div>

      {voiceEnabled && supported && (
        <p className="mb-3 text-center text-sm font-bold text-mq-muted">
          Nhấn 🔊 để nghe đáp án, nhấn ô để chọn
        </p>
      )}

      <div className={`mt-auto grid grid-cols-2 gap-3 ${voiceEnabled ? "gap-4" : ""}`}>
        {question.options.map((opt) => (
          <div key={opt} className="relative">
            {voiceEnabled && supported && !picked && (
              <div className="absolute -right-1 -top-1 z-10">
                <SpeakButton label={`Nghe đáp án ${opt}`} onClick={() => handleReadOption(opt)} />
              </div>
            )}
            <button
              type="button"
              onClick={() => choose(opt)}
              disabled={!!picked}
              className={`w-full rounded-mq-sm bg-white font-extrabold shadow-sm transition ${
                voiceEnabled ? "min-h-[80px] text-3xl" : "min-h-[64px] text-xl"
              } ${
                picked === opt
                  ? opt === question.answer
                    ? "ring-2 ring-mq-success bg-green-50"
                    : "ring-2 ring-mq-danger bg-red-50"
                  : picked
                    ? "opacity-60"
                    : "hover:ring-2 hover:ring-mq-primary/30 active:scale-[0.98]"
              }`}
            >
              {opt}
            </button>
          </div>
        ))}
      </div>

      {picked && !voiceEnabled && (
        <p className="mt-4 text-center text-sm font-semibold text-mq-muted">
          {picked === question.answer ? "✅ Chính xác! " : "💡 Gợi ý: "}
          {question.explanation}
        </p>
      )}

      {picked && voiceEnabled && (
        <p className="mt-4 text-center text-lg font-extrabold text-mq-primary">
          {picked === question.answer ? "✅ Giỏi lắm!" : "💡 Cố gắng nhé!"}
        </p>
      )}
    </div>
  );
}
