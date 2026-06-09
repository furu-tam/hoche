const SYMBOL_SPEECH: [RegExp, string][] = [
  [/□/g, " chỗ trống "],
  [/−/g, " trừ "],
  [/–/g, " trừ "],
  [/\+/g, " cộng "],
  [/×/g, " nhân "],
  [/÷/g, " chia "],
  [/=/g, " bằng "],
  [/\?/g, " bao nhiêu"],
  [/>/g, " lớn hơn "],
  [/</g, " bé hơn "],
  [/cm²/g, " centimet vuông"],
  [/cm³/g, " centimet khối"],
  [/km\/giờ/g, " ki lô mét trên giờ"],
  [/m\/giây/g, " mét trên giây"],
  [/\.000đ/g, " nghìn đồng"],
  [/đ/g, " đồng "],
  [/cm/g, " centimet"],
  [/km/g, " ki lô mét"],
  [/l\b/g, " lít"],
  [/ml/g, " mi li lít"],
  [/kg/g, " ki lô gam"],
  [/g\b/g, " gam"],
];

const OPTION_SPEECH: Record<string, string> = {
  ">": "lớn hơn",
  "<": "bé hơn",
  "=": "bằng nhau",
  "Tam giác": "tam giác",
  "Hình vuông": "hình vuông",
  "Hình chữ nhật": "hình chữ nhật",
  "Tròn": "hình tròn",
  "Vuông": "hình vuông",
  "Phải": "bên phải",
  "Trái": "bên trái",
  "Trên": "phía trên",
  "Dưới": "phía dưới",
  "Trong": "bên trong",
  "Ngoài": "bên ngoài",
  "Sáng": "buổi sáng",
  "Trưa": "buổi trưa",
  "Chiều": "buổi chiều",
  "Tối": "buổi tối",
};

/** Chuyển câu hỏi toán thành văn bản dễ nghe cho trẻ lớp 1 */
export function mathTextToSpeech(text: string): string {
  let out = text.trim();
  for (const [pattern, replacement] of SYMBOL_SPEECH) {
    out = out.replace(pattern, replacement);
  }
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

/** Đọc đáp án / lựa chọn */
export function optionToSpeech(option: string): string {
  const mapped = OPTION_SPEECH[option];
  if (mapped) return mapped;
  if (/^\d+$/.test(option)) return `số ${option}`;
  if (/^\d+,\d+$/.test(option)) return `số ${option.replace(",", " phẩy ")}`;
  if (option.includes("/")) return `phân số ${option.replace("/", " trên ")}`;
  return mathTextToSpeech(option);
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "vi-VN") ??
    voices.find((v) => v.lang.startsWith("vi")) ??
    null
  );
}

let voicesReady = false;

function ensureVoices(): Promise<void> {
  if (!isSpeechSupported()) return Promise.resolve();
  if (voicesReady && pickVietnameseVoice()) return Promise.resolve();

  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesReady = true;
      resolve();
      return;
    }
    const onVoices = () => {
      voicesReady = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    setTimeout(() => {
      voicesReady = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve();
    }, 500);
  });
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  { rate = 0.88, pitch = 1.05 }: { rate?: number; pitch?: number } = {}
): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return Promise.resolve();

  return ensureVoices().then(
    () =>
      new Promise((resolve) => {
        stopSpeaking();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "vi-VN";
        utterance.rate = rate;
        utterance.pitch = pitch;
        const voice = pickVietnameseVoice();
        if (voice) utterance.voice = voice;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      })
  );
}

export async function speakQuestion(prompt: string): Promise<void> {
  await speakText(mathTextToSpeech(prompt));
}

export async function speakOption(option: string): Promise<void> {
  await speakText(optionToSpeech(option), { rate: 0.85 });
}

export async function speakFeedback(correct: boolean, explanation: string): Promise<void> {
  const intro = correct ? "Chính xác! " : "Chưa đúng. ";
  await speakText(intro + mathTextToSpeech(explanation), { rate: 0.85 });
}
