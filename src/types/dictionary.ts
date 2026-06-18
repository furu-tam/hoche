export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: DictionaryMeaning[];
}

export type DictionaryLookupResult =
  | { ok: true; entry: DictionaryEntry }
  | { ok: false; error: "not_found" | "network" | "invalid" };
