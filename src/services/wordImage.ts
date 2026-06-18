interface WikiSummary {
  thumbnail?: { source?: string };
}

export async function fetchWordImage(word: string): Promise<string | undefined> {
  const titles = [word, word.charAt(0).toUpperCase() + word.slice(1)];

  for (const title of titles) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      );
      if (!res.ok) continue;

      const data = (await res.json()) as WikiSummary;
      if (data.thumbnail?.source) return data.thumbnail.source;
    } catch {
      // thử title tiếp theo
    }
  }

  return undefined;
}
