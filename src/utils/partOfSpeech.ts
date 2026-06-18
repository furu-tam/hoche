const POS_VI: Record<string, string> = {
  noun: "danh từ",
  verb: "động từ",
  adjective: "tính từ",
  adverb: "trạng từ",
  pronoun: "đại từ",
  preposition: "giới từ",
  conjunction: "liên từ",
  interjection: "thán từ",
  exclamation: "thán từ",
  article: "mạo từ",
  determiner: "từ hạn định",
  phrase: "cụm từ",
};

export function partOfSpeechVi(pos: string): string {
  return POS_VI[pos.toLowerCase()] ?? pos;
}
