"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { lookupEnglishWord } from "@/services/dictionary";
import type { DictionaryEntry } from "@/types/dictionary";
import { speakEnglish } from "@/utils/speech";

const SUGGESTED_WORDS = ["hello", "apple", "school", "math", "friend", "happy", "read", "write"];

const ERROR_MESSAGES = {
  not_found: "Không tìm thấy từ này. Thử từ khác nhé!",
  network: "Không kết nối được. Kiểm tra mạng và thử lại.",
  invalid: "Hãy nhập từ tiếng Anh (chữ cái a–z).",
} as const;

function playAudio(url: string, fallbackWord: string): void {
  const audio = new Audio(url);
  void audio.play().catch(() => speakEnglish(fallbackWord));
}

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<keyof typeof ERROR_MESSAGES | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setLoading(true);
    setError(null);
    setEntry(null);

    const result = await lookupEnglishWord(trimmed);
    setLoading(false);

    if (result.ok) {
      setEntry(result.entry);
      return;
    }
    setError(result.error);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void search(query);
  };

  const pronounce = (word: string, audioUrl?: string) => {
    if (audioUrl) {
      playAudio(audioUrl, word);
      return;
    }
    void speakEnglish(word);
  };

  return (
    <div className="page-wrap">
      <AppShell activeNav="dictionary">
        <main className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Từ điển Anh</h1>
          <p className="mb-4 text-sm text-mq-muted">Tra nghĩa và nghe phát âm từ tiếng Anh</p>

          <form onSubmit={onSubmit} className="mb-4 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ tiếng Anh..."
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-h-[48px] flex-1 rounded-mq-sm border-2 border-sky-100 bg-white px-4 text-base font-bold outline-none focus:border-mq-primary"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="min-h-[48px] rounded-mq-sm bg-mq-primary px-4 font-extrabold text-white disabled:opacity-50 active:scale-[0.97]"
            >
              {loading ? "..." : "Tra"}
            </button>
          </form>

          <div className="mb-4 flex flex-wrap gap-2">
            {SUGGESTED_WORDS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => void search(word)}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-mq-primary shadow-sm active:scale-95"
              >
                {word}
              </button>
            ))}
          </div>

          {loading && (
            <div className="rounded-mq-sm bg-white p-6 text-center text-sm font-bold text-mq-muted">
              Đang tra từ...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-mq-sm bg-red-50 p-4 text-center text-sm font-bold text-mq-danger">
              {ERROR_MESSAGES[error]}
            </div>
          )}

          {entry && !loading && (
            <article className="rounded-mq bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold capitalize text-slate-800">{entry.word}</h2>
                  {entry.phonetic && (
                    <p className="text-sm font-semibold text-mq-muted">{entry.phonetic}</p>
                  )}
                </div>
                <SpeakButton
                  onClick={() => pronounce(entry.word, entry.audioUrl)}
                  label="Nghe phát âm"
                  size="lg"
                  className="!w-auto !min-h-[44px] !px-4 !text-sm"
                />
              </div>

              <div className="flex flex-col gap-4">
                {entry.meanings.map((meaning, i) => (
                  <section key={`${meaning.partOfSpeech}-${i}`}>
                    <h3 className="mb-2 inline-block rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold uppercase text-mq-primary">
                      {meaning.partOfSpeech}
                    </h3>
                    <ol className="flex flex-col gap-2 pl-1">
                      {meaning.definitions.map((def, j) => (
                        <li key={j} className="text-sm leading-relaxed">
                          <span className="font-bold text-slate-700">{j + 1}. </span>
                          {def.definition}
                          {def.example && (
                            <p className="mt-1 pl-4 text-xs italic text-mq-muted">
                              &ldquo;{def.example}&rdquo;
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </article>
          )}

          {!entry && !loading && !error && (
            <div className="mt-2 rounded-mq-sm border-2 border-dashed border-sky-200 p-6 text-center text-sm text-mq-muted">
              Gõ từ tiếng Anh rồi bấm Tra, hoặc chọn từ gợi ý phía trên
            </div>
          )}
        </main>
      </AppShell>
    </div>
  );
}
