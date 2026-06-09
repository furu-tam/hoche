"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isSpeechSupported,
  speakFeedback,
  speakOption,
  speakQuestion,
  speakText,
  stopSpeaking,
} from "@/utils/speech";

export function useSpeech(enabled: boolean) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => stopSpeaking();
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !supported) return Promise.resolve();
      return speakText(text);
    },
    [enabled, supported]
  );

  const readQuestion = useCallback(
    (prompt: string) => {
      if (!enabled || !supported) return Promise.resolve();
      return speakQuestion(prompt);
    },
    [enabled, supported]
  );

  const readOption = useCallback(
    (option: string) => {
      if (!enabled || !supported) return Promise.resolve();
      return speakOption(option);
    },
    [enabled, supported]
  );

  const readFeedback = useCallback(
    (correct: boolean, explanation: string) => {
      if (!enabled || !supported) return Promise.resolve();
      return speakFeedback(correct, explanation);
    },
    [enabled, supported]
  );

  const cancel = useCallback(() => stopSpeaking(), []);

  return { supported, speak, readQuestion, readOption, readFeedback, cancel };
}
