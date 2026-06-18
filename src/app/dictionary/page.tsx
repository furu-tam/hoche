"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/ui/AppShell";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { lookupEnglishWord } from "@/services/dictionary";
import type { DictionaryEntry } from "@/types/dictionary";
import { partOfSpeechVi } from "@/utils/partOfSpeech";
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

  const clearSearch = () => {
    setQuery("");
    setEntry(null);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="page-wrap">
      <AppShell activeNav="dictionary">
        <main className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
          <h1 className="mb-1 text-2xl font-extrabold text-mq-primary">Từ điển Anh</h1>
          <p className="mb-4 text-sm text-mq-muted">Tra nghĩa tiếng Việt, nghe phát âm và xem hình minh họa</p>

          <form onSubmit={onSubmit} className="mb-4 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ tiếng Anh..."
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-h-[48px] w-full rounded-mq-sm border-2 border-sky-100 bg-white py-2 pl-4 pr-10 text-base font-bold outline-none focus:border-mq-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Xóa từ"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-sm font-extrabold text-slate-500 active:scale-95"
                >
                  ×
                </button>
              )}
            </div>
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
              Đang tra từ và dịch nghĩa...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-mq-sm bg-red-50 p-4 text-center text-sm font-bold text-mq-danger">
              {ERROR_MESSAGES[error]}
            </div>
          )}

          {entry && !loading && (
            <article className="rounded-mq bg-white p-4 shadow-sm">
              {entry.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-mq-sm bg-sky-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt={`Hình minh họa: ${entry.word}`}
                    className="mx-auto max-h-44 w-full object-cover"
                  />
                </div>
              )}

              <div className="mb-4 flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold capitalize text-slate-800">{entry.word}</h2>
                  {entry.wordVi && (
                    <p className="mt-0.5 text-lg font-extrabold text-mq-primary">→ {entry.wordVi}</p>
                  )}
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
                    <h3 className="mb-2 inline-block rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold text-mq-primary">
                      {partOfSpeechVi(meaning.partOfSpeech)}
                    </h3>
                    <ol className="flex flex-col gap-3 pl-1">
                      {meaning.definitions.map((def, j) => (
                        <li key={j} className="text-sm leading-relaxed">
                          <span className="font-bold text-slate-700">{j + 1}. </span>
                          <span className="font-bold text-slate-800">
                            {def.definitionVi ?? def.definition}
                          </span>
                          {def.definitionVi && (
                            <p className="mt-0.5 text-xs text-mq-muted">{def.definition}</p>
                          )}
                          {(def.exampleVi || def.example) && (
                            <p className="mt-1.5 rounded-mq-sm bg-amber-50 px-3 py-2 text-xs">
                              <span className="font-bold text-mq-accent">Ví dụ: </span>
                              <span className="italic text-slate-700">
                                {def.exampleVi ? `“${def.exampleVi}”` : def.example && `“${def.example}”`}
                              </span>
                              {def.exampleVi && def.example && (
                                <span className="mt-1 block text-mq-muted not-italic">
                                  ({def.example})
                                </span>
                              )}
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
