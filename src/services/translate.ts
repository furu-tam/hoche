const TRANSLATE_API = "https://api.mymemory.translated.net/get";

export async function translateToVietnamese(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const url = `${TRANSLATE_API}?q=${encodeURIComponent(trimmed)}&langpair=en|vi`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };

    if (data.responseStatus !== 200) return null;

    const translated = data.responseData?.translatedText?.trim();
    if (!translated || translated.toUpperCase() === trimmed.toUpperCase()) return translated ?? null;

    return translated;
  } catch {
    return null;
  }
}

export async function translateManyToVietnamese(texts: string[]): Promise<(string | null)[]> {
  return Promise.all(texts.map((text) => translateToVietnamese(text)));
}
