import type { DictionaryEntry, DictionaryLookupResult } from "@/types/dictionary";
import { translateManyToVietnamese } from "@/services/translate";
import { fetchWordImage } from "@/services/wordImage";

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
        .slice(0, 3)
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

async function enrichWithVietnamese(entry: DictionaryEntry): Promise<DictionaryEntry> {
  const textsToTranslate: string[] = [entry.word];
  const slots: { kind: "word" | "def" | "ex"; mi: number; di: number }[] = [
    { kind: "word", mi: -1, di: -1 },
  ];

  for (let mi = 0; mi < entry.meanings.length; mi++) {
    for (let di = 0; di < entry.meanings[mi].definitions.length; di++) {
      const def = entry.meanings[mi].definitions[di];
      textsToTranslate.push(def.definition);
      slots.push({ kind: "def", mi, di });
      if (def.example) {
        textsToTranslate.push(def.example);
        slots.push({ kind: "ex", mi, di });
      }
    }
  }

  const translated = await translateManyToVietnamese(textsToTranslate);
  const enriched: DictionaryEntry = {
    ...entry,
    meanings: entry.meanings.map((m) => ({
      ...m,
      definitions: m.definitions.map((d) => ({ ...d })),
    })),
  };

  for (let i = 0; i < slots.length; i++) {
    const vi = translated[i];
    if (!vi) continue;

    const slot = slots[i];
    if (slot.kind === "word") {
      enriched.wordVi = vi;
      continue;
    }

    const def = enriched.meanings[slot.mi].definitions[slot.di];
    if (slot.kind === "def") def.definitionVi = vi;
    else def.exampleVi = vi;
  }

  return enriched;
}

export async function lookupEnglishWord(input: string): Promise<DictionaryLookupResult> {
  const word = normalizeWord(input);
  if (!word) return { ok: false, error: "invalid" };

  try {
    const [dictRes, imageUrl] = await Promise.all([
      fetch(`${API_BASE}/${encodeURIComponent(word)}`),
      fetchWordImage(word),
    ]);

    if (dictRes.status === 404) return { ok: false, error: "not_found" };
    if (!dictRes.ok) return { ok: false, error: "network" };

    const data = (await dictRes.json()) as ApiEntry[];
    let entry = toEntry(data[0]);
    if (!entry.meanings.length) return { ok: false, error: "not_found" };

    if (imageUrl) entry = { ...entry, imageUrl };
    entry = await enrichWithVietnamese(entry);

    return { ok: true, entry };
  } catch {
    return { ok: false, error: "network" };
  }
}
