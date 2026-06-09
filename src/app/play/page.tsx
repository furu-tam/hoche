"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MathQuiz } from "@/components/MathQuiz/MathQuiz";
import { AppShell } from "@/components/ui/AppShell";
import { generateExamQuestions } from "@/services/examQuestions";
import { getStartStepIndex } from "@/services/learningPath";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { dailyTotalProgress, useAppStore } from "@/store/appStore";
import { DAILY_QUESTION_COUNT } from "@/types/curriculum";
import type { MathQuestion } from "@/types/question";

export default function PlayPage() {
  const router = useRouter();
  const profile = useActiveProfile();
  const startSession = useAppStore((s) => s.startSession);
  const ensureTodayExam = useAppStore((s) => s.ensureTodayExam);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const completeDaily = useAppStore((s) => s.completeDaily);

  const path = profile.todayExamPath ?? [];
  const pathKey = path.map((s) => s.topicId).join("|");
  const questionsCacheRef = useRef<{ pathKey: string; questions: MathQuestion[] } | null>(null);

  const questions = useMemo(() => {
    if (!path.length) return [];
    if (questionsCacheRef.current?.pathKey === pathKey) {
      return questionsCacheRef.current.questions;
    }
    const generated = generateExamQuestions(path, profile.grade, profile.moduleDifficulty);
    questionsCacheRef.current = { pathKey, questions: generated };
    return generated;
    // moduleDifficulty chỉ snapshot lúc tạo đề, không tạo lại sau mỗi câu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, pathKey, profile.grade]);

  const startAt = useMemo(() => {
    if (!path.length) return -1;
    if (profile.dailyComplete) return -1;
    return getStartStepIndex(path, profile.dailyProgress);
  }, [path, profile.dailyProgress, profile.dailyComplete]);

  const [stepIndex, setStepIndex] = useState<number | null>(null);

  useEffect(() => {
    startSession();
    ensureTodayExam();
  }, [startSession, ensureTodayExam]);

  useEffect(() => {
    if (!path.length) return;
    if (startAt < 0 || startAt >= path.length) {
      router.replace("/");
      return;
    }
    setStepIndex(startAt);
  }, [path.length, startAt, router]);

  const ready = stepIndex !== null && questions.length > 0 && startAt >= 0;
  const currentStep = ready ? path[stepIndex] : undefined;
  const question = ready ? questions[stepIndex] : null;

  const handleAnswer = useCallback(
    (correct: boolean, responseTime: number) => {
      if (!currentStep || !question || stepIndex === null) return;
      recordAnswer(currentStep.topicId, correct, responseTime, question.difficulty);

      const delay = profile.grade === 1 ? 1200 : 900;
      setTimeout(() => {
        const nextIndex = stepIndex + 1;
        if (nextIndex < path.length) {
          setStepIndex(nextIndex);
        } else {
          completeDaily();
          router.push("/reward");
        }
      }, delay);
    },
    [
      currentStep,
      question,
      stepIndex,
      path.length,
      profile.grade,
      recordAnswer,
      completeDaily,
      router,
    ]
  );

  const questionLabel = currentStep
    ? `Câu ${stepIndex! + 1}/${path.length} · ${currentStep.topicLabel}`
    : "";

  const done = dailyTotalProgress(profile.dailyProgress);

  if (!ready || !question || !currentStep) {
    return (
      <div className="page-wrap">
        <AppShell showNav={false}>
          <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-5">
            <div className="animate-bounce text-4xl">📐</div>
            <p className="font-bold text-mq-muted">Đang chuẩn bị đề...</p>
          </main>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <AppShell showNav={false}>
        <main className="flex flex-1 flex-col px-4 py-5">
          <Link href="/" className="mb-3 text-sm font-bold text-mq-muted">
            ← Quay lại
          </Link>
          <div className="mb-3 flex justify-between text-xs font-bold text-mq-muted">
            <span>
              <span className="mr-1 text-base">{currentStep.topicIcon}</span>
              {currentStep.topicLabel}
            </span>
            <span>
              Hôm nay: {done}/{DAILY_QUESTION_COUNT}
            </span>
          </div>
          <MathQuiz
            key={`${stepIndex}-${question.promptText}-${question.answer}`}
            question={question}
            questionLabel={questionLabel}
            voiceEnabled={profile.grade === 1}
            onAnswer={handleAnswer}
          />
        </main>
      </AppShell>
    </div>
  );
}
