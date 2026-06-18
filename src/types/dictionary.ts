export interface DictionaryDefinition {
  definition: string;
  definitionVi?: string;
  example?: string;
  exampleVi?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  wordVi?: string;
  phonetic?: string;
  audioUrl?: string;
  imageUrl?: string;
  meanings: DictionaryMeaning[];
}

export type DictionaryLookupResult =
  | { ok: true; entry: DictionaryEntry }
  | { ok: false; error: "not_found" | "network" | "invalid" };
