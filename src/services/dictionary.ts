import type { DictionaryEntry, DictionaryLookupResult } from "@/types/dictionary";

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

interface ApiPhonetic {
  text?: string;
  audio?: string;
}

interface ApiDefinition {
  definition: string;
  example?: string;
}

interface ApiMeaning {
  partOfSpeech: string;
  definitions: ApiDefinition[];
}

interface ApiEntry {
  word: string;
  phonetic?: string;
  phonetics?: ApiPhonetic[];
  meanings?: ApiMeaning[];
}

function normalizeWord(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z'-]/g, "");
}

function pickAudioUrl(phonetics: ApiPhonetic[] | undefined): string | undefined {
  if (!phonetics?.length) return undefined;
  return phonetics.find((p) => p.audio)?.audio || undefined;
}

function toEntry(raw: ApiEntry): DictionaryEntry {
  const meanings =
    raw.meanings?.map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions
        .filter((d) => d.definition?.trim())
        .slice(0, 4)
        .map((d) => ({
          definition: d.definition.trim(),
          example: d.example?.trim() || undefined,
        })),
    })) ?? [];

  return {
    word: raw.word,
    phonetic: raw.phonetic ?? raw.phonetics?.find((p) => p.text)?.text,
    audioUrl: pickAudioUrl(raw.phonetics),
    meanings: meanings.filter((m) => m.definitions.length > 0),
  };
}

export async function lookupEnglishWord(input: string): Promise<DictionaryLookupResult> {
  const word = normalizeWord(input);
  if (!word) return { ok: false, error: "invalid" };

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (!res.ok) return { ok: false, error: "network" };

    const data = (await res.json()) as ApiEntry[];
    const entry = toEntry(data[0]);
    if (!entry.meanings.length) return { ok: false, error: "not_found" };

    return { ok: true, entry };
  } catch {
    return { ok: false, error: "network" };
  }
}
