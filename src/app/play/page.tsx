"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MathQuiz } from "@/components/MathQuiz/MathQuiz";
import { AppShell } from "@/components/ui/AppShell";
import { getStartStepIndex } from "@/services/learningPath";
import { generateQuestion } from "@/services/questionGenerator";
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
  const getDifficultyForTopic = useAppStore((s) => s.getDifficultyForTopic);

  const path = profile.todayExamPath ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  const currentStep = path[stepIndex];
  const currentTopicId = currentStep?.topicId;

  useEffect(() => {
    startSession();
    ensureTodayExam();
  }, [startSession, ensureTodayExam]);

  useEffect(() => {
    const exam = profile.todayExamPath;
    if (!exam?.length || initRef.current) return;
    initRef.current = true;
    const startAt = getStartStepIndex(exam, profile.dailyProgress);
    if (startAt >= exam.length || profile.dailyComplete) {
      router.replace("/");
      return;
    }
    setStepIndex(startAt);
    setReady(true);
  }, [profile.todayExamPath, profile.dailyProgress, profile.dailyComplete, router]);

  useEffect(() => {
    if (!ready || !currentTopicId) return;
    const difficulty = getDifficultyForTopic(currentTopicId);
    setQuestion(generateQuestion(currentTopicId, difficulty, profile.grade));
  }, [ready, stepIndex, currentTopicId, profile.grade, getDifficultyForTopic]);

  const handleAnswer = useCallback(
    (correct: boolean, responseTime: number) => {
      if (!currentStep || !question) return;
      recordAnswer(currentStep.topicId, correct, responseTime, question.difficulty);

      setTimeout(() => {
        const nextIndex = stepIndex + 1;
        if (nextIndex < path.length) {
          setStepIndex(nextIndex);
        } else {
          completeDaily();
          router.push("/reward");
        }
      }, 900);
    },
    [currentStep, question, stepIndex, path.length, recordAnswer, completeDaily, router]
  );

  const questionLabel = currentStep
    ? `Câu ${stepIndex + 1}/${path.length} · ${currentStep.topicLabel}`
    : "";

  const done = dailyTotalProgress(profile.dailyProgress);

  if (!ready || !path.length) {
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
              {currentStep && (
                <>
                  <span className="mr-1 text-base">{currentStep.topicIcon}</span>
                  {currentStep.topicLabel}
                </>
              )}
            </span>
            <span>
              Hôm nay: {done}/{DAILY_QUESTION_COUNT}
            </span>
          </div>
          {!question ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <div className="animate-bounce text-4xl">📐</div>
              <p className="font-bold text-mq-muted">Đang tạo câu...</p>
            </div>
          ) : (
            <MathQuiz
              key={`${stepIndex}-${question.promptText}-${question.answer}`}
              question={question}
              questionLabel={questionLabel}
              onAnswer={handleAnswer}
            />
          )}
        </main>
      </AppShell>
    </div>
  );
}
