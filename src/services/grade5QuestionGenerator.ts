import type { Grade5TopicId } from "@/types/grade5Curriculum";
import { getGrade5TopicLabel } from "@/types/grade5Curriculum";
import type { Difficulty, MathQuestion } from "@/types/question";
import {
  formatNumber,
  mcqNumber,
  mcqString,
  randInt,
  shuffle,
} from "@/utils/questionUtils";

function base(topicId: Grade5TopicId, difficulty: Difficulty, partial: Omit<MathQuestion, "type" | "topicId" | "topicLabel" | "module" | "difficulty">): MathQuestion {
  return {
    type: "math",
    module: "fractions",
    topicId,
    topicLabel: getGrade5TopicLabel(topicId),
    difficulty,
    ...partial,
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const GENERATORS: Record<Grade5TopicId, (d: Difficulty) => MathQuestion> = {
  g5_natural_read: (d) => {
    const n = randInt(10000, d === 1 ? 50000 : 999999);
    const digits = String(n).split("").map(Number);
    const pos = randInt(0, digits.length - 1);
    const place = digits.length - pos - 1;
    const answer = digits[pos] * 10 ** place;
    const s = formatNumber(n);
    return base("g5_natural_read", d, {
      promptText: `Trong số ${s}, chữ số ${digits[pos]} có giá trị là?`,
      ...mcqNumber(answer, answer >= 1000 ? 5000 : 500),
      explanation: `Chữ số ${digits[pos]} ở hàng ${place === 0 ? "đơn vị" : `10^${place}`} → giá trị ${formatNumber(answer)}`,
    });
  },

  g5_natural_compare: (d) => {
    const nums = shuffle(
      Array.from({ length: 4 }, () => randInt(1000, d === 1 ? 20000 : 100000))
    );
    const answer = Math.max(...nums);
    return base("g5_natural_compare", d, {
      promptText: `Số nào lớn nhất?`,
      ...mcqString(
        String(answer),
        nums.filter((n) => n !== answer).map(String)
      ),
      explanation: `${formatNumber(answer)} là số lớn nhất trong các lựa chọn.`,
    });
  },

  g5_natural_arithmetic: (d) => {
    const ops = ["+", "−", "×", "÷"] as const;
    const op = ops[randInt(0, d === 1 ? 1 : 3)];
    let a = randInt(100, d === 1 ? 500 : 2000);
    let b = randInt(10, d === 1 ? 100 : 500);
    let answer = 0;
    let prompt = "";
    if (op === "+") {
      answer = a + b;
      prompt = `${formatNumber(a)} + ${formatNumber(b)} = ?`;
    } else if (op === "−") {
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      prompt = `${formatNumber(a)} − ${formatNumber(b)} = ?`;
    } else if (op === "×") {
      a = randInt(12, 99);
      b = randInt(2, d === 1 ? 9 : 25);
      answer = a * b;
      prompt = `${a} × ${b} = ?`;
    } else {
      b = randInt(2, 12);
      answer = randInt(5, 30);
      a = b * answer;
      prompt = `${a} ÷ ${b} = ?`;
    }
    return base("g5_natural_arithmetic", d, {
      promptText: prompt,
      ...mcqNumber(answer, Math.max(10, Math.round(answer * 0.1))),
      explanation: `Kết quả là ${formatNumber(answer)}.`,
    });
  },

  g5_natural_expression: (d) => {
    const templates = [
      () => {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        const c = randInt(1, 9);
        const answer = a + b * c;
        return { prompt: `${a} + ${b} × ${c} = ?`, answer, exp: `Nhân trước: ${b}×${c}=${b * c}, rồi +${a} → ${answer}` };
      },
      () => {
        const a = randInt(10, 30);
        const b = randInt(2, 8);
        const c = randInt(2, 6);
        const answer = (a - b) * c;
        return { prompt: `(${a} − ${b}) × ${c} = ?`, answer, exp: `Trong ngoặc: ${a - b}, nhân ${c} → ${answer}` };
      },
    ];
    const t = templates[randInt(0, d === 1 ? 0 : templates.length - 1)]();
    return base("g5_natural_expression", d, {
      promptText: t.prompt,
      ...mcqNumber(t.answer, 8),
      explanation: t.exp,
    });
  },

  g5_natural_unknown: (d) => {
    const kinds = ["addend", "factor", "dividend"] as const;
    const kind = kinds[randInt(0, d === 1 ? 1 : 2)];
    if (kind === "addend") {
      const x = randInt(5, 50);
      const b = randInt(10, 80);
      const sum = x + b;
      return base("g5_natural_unknown", d, {
        promptText: `x + ${b} = ${sum}. Tìm x.`,
        ...mcqNumber(x, 5),
        explanation: `x = ${sum} − ${b} = ${x}`,
      });
    }
    if (kind === "factor") {
      const x = randInt(3, 12);
      const b = randInt(3, 12);
      const prod = x * b;
      return base("g5_natural_unknown", d, {
        promptText: `x × ${b} = ${prod}. Tìm x.`,
        ...mcqNumber(x, 3),
        explanation: `x = ${prod} ÷ ${b} = ${x}`,
      });
    }
    const x = randInt(4, 15);
    const divisor = randInt(2, 9);
    const dividend = x * divisor;
    return base("g5_natural_unknown", d, {
      promptText: `${dividend} ÷ x = ${divisor}. Tìm x.`,
      ...mcqNumber(x, 3),
      explanation: `x = ${dividend} ÷ ${divisor} = ${x}`,
    });
  },

  g5_natural_divisibility: (d) => {
    const rules = [
      { div: 2, test: (n: number) => n % 2 === 0 },
      { div: 3, test: (n: number) => n % 3 === 0 },
      { div: 5, test: (n: number) => n % 5 === 0 },
      { div: 9, test: (n: number) => n % 9 === 0 },
    ];
    const rule = rules[randInt(0, d === 1 ? 1 : rules.length - 1)];
    const correct = randInt(10, 99);
    const adjusted = rule.test(correct) ? correct : correct + (rule.div - (correct % rule.div));
    const wrong = [adjusted + 1, adjusted + 2, adjusted + rule.div + 1];
    return base("g5_natural_divisibility", d, {
      promptText: `Số nào chia hết cho ${rule.div}?`,
      ...mcqString(String(adjusted), wrong.map(String)),
      explanation: `Số ${adjusted} chia hết cho ${rule.div}.`,
    });
  },

  g5_fraction_concept: () => {
    const denom = randInt(3, 9);
    const num = randInt(1, denom - 1);
    const prompts = [
      { q: `Trong phân số ${num}/${denom}, tử số là?`, a: String(num), w: [String(denom), String(num + 1), String(num - 1 || 1)] },
      { q: `Phân số ${num}/${denom} so với 1 thì?`, a: num < denom ? "Bé hơn 1" : "Lớn hơn 1", w: ["Bằng 1", "Lớn hơn 1", "Bé hơn 1"].filter((x) => x !== (num < denom ? "Bé hơn 1" : "Lớn hơn 1")) },
    ];
    const p = prompts[randInt(0, 1)];
    return base("g5_fraction_concept", 2, {
      promptText: p.q,
      ...mcqString(p.a, p.w),
      explanation: `Đáp án: ${p.a}`,
    });
  },

  g5_fraction_equal: () => {
    const denom = randInt(2, 6);
    const num = randInt(1, denom - 1);
    const k = randInt(2, 4);
    const answer = `${num * k}/${denom * k}`;
    return base("g5_fraction_equal", 2, {
      promptText: `Phân số nào bằng ${num}/${denom}?`,
      ...mcqString(answer, [`${num}/${denom + 1}`, `${num + 1}/${denom}`, `${num * k}/${denom * k + 1}`]),
      explanation: `${num}/${denom} = ${answer} (nhân tử và mẫu cùng ${k}).`,
    });
  },

  g5_fraction_simplify: () => {
    const k = randInt(2, 5);
    const n = randInt(1, 4) * k;
    const d = randInt(2, 5) * k;
    const g = gcd(n, d);
    const answer = `${n / g}/${d / g}`;
    return base("g5_fraction_simplify", 2, {
      promptText: `Rút gọn phân số ${n}/${d}`,
      ...mcqString(answer, [`${n}/${d}`, `${n / 2}/${d}`, `${n}/${d / 2}`]),
      explanation: `${n}/${d} = ${answer}`,
    });
  },

  g5_fraction_compare: () => {
    const denom = randInt(4, 10);
    const a = randInt(1, denom - 2);
    const b = randInt(a + 1, denom - 1);
    return base("g5_fraction_compare", 2, {
      promptText: `So sánh: ${a}/${denom} và ${b}/${denom}`,
      ...mcqString("<", [">", "=", "Không so sánh được"]),
      explanation: `Cùng mẫu ${denom}: ${a}/${denom} < ${b}/${denom}`,
    });
  },

  g5_fraction_ops: (d) => {
    const denom = randInt(2, 8);
    const n1 = randInt(1, denom - 1);
    const n2 = randInt(1, denom - 1);
    const ops = d === 1 ? ["+"] : ["+", "−"];
    const op = ops[randInt(0, ops.length - 1)];
    const num = op === "+" ? n1 + n2 : Math.max(1, n1 - n2);
    const answer = `${num}/${denom}`;
    return base("g5_fraction_ops", d, {
      promptText: `${n1}/${denom} ${op} ${n2}/${denom} = ?`,
      ...mcqString(answer, [`${n1 + n2}/${denom + 1}`, `${n1}/${denom + n2}`, `${n2}/${denom}`]),
      explanation: `Cùng mẫu: ${answer}`,
    });
  },

  g5_fraction_mixed: () => {
    const whole = randInt(1, 4);
    const denom = randInt(2, 6);
    const num = randInt(1, denom - 1);
    const improper = whole * denom + num;
    const answer = `${improper}/${denom}`;
    return base("g5_fraction_mixed", 2, {
      promptText: `Hỗn số ${whole} ${num}/${denom} = ? (phân số)`,
      ...mcqString(answer, [`${whole + num}/${denom}`, `${improper}/${denom + 1}`, `${num}/${denom}`]),
      explanation: `${whole} ${num}/${denom} = (${whole}×${denom}+${num})/${denom} = ${answer}`,
    });
  },

  g5_decimal_read: () => {
    const n = randInt(10, 999);
    const dec = n / 100;
    const pos = randInt(0, 1);
    const s = dec.toFixed(2);
    const answer = pos === 0 ? Math.floor(n / 10) : n % 10;
    return base("g5_decimal_read", 2, {
      promptText: `Trong số ${s.replace(".", ",")}, chữ số ở hàng phần ${pos === 0 ? "mười" : "trăm"} có giá trị?`,
      ...mcqNumber(answer, 2),
      explanation: `Số ${s}: hàng phần mười là ${Math.floor(n / 10)}, phần trăm là ${n % 10}.`,
    });
  },

  g5_decimal_compare: () => {
    const a = (randInt(100, 500) / 100).toFixed(2);
    const b = (randInt(100, 500) / 100).toFixed(2);
    const answer = parseFloat(a) > parseFloat(b) ? ">" : parseFloat(a) < parseFloat(b) ? "<" : "=";
    return base("g5_decimal_compare", 2, {
      promptText: `${a.replace(".", ",")} □ ${b.replace(".", ",")}`,
      options: shuffle([">", "<", "="]),
      answer,
      explanation: `${a} ${answer} ${b}`,
    });
  },

  g5_decimal_ops: (d) => {
    const a = randInt(10, d === 1 ? 50 : 99) / 10;
    const b = randInt(10, d === 1 ? 50 : 99) / 10;
    const sum = Math.round((a + b) * 10) / 10;
    return base("g5_decimal_ops", d, {
      promptText: `${a} + ${b} = ?`,
      options: shuffle([String(sum), String(sum + 0.1), String(Math.max(0, sum - 0.2)), String(sum + 0.3)]),
      answer: String(sum),
      explanation: `${a} + ${b} = ${sum}`,
    });
  },

  g5_decimal_convert: () => {
    const pairs = [
      { frac: "1/2", dec: "0,5" },
      { frac: "1/4", dec: "0,25" },
      { frac: "3/4", dec: "0,75" },
      { frac: "1/5", dec: "0,2" },
    ];
    const p = pairs[randInt(0, pairs.length - 1)];
    const toDec = Math.random() > 0.5;
    return base("g5_decimal_convert", 2, {
      promptText: toDec ? `Phân số ${p.frac} = ? (số thập phân)` : `Số thập phân ${p.dec} = ? (phân số)`,
      ...mcqString(toDec ? p.dec : p.frac, pairs.filter((x) => x !== p).map((x) => (toDec ? x.dec : x.frac))),
      explanation: `${p.frac} = ${p.dec}`,
    });
  },

  g5_decimal_round: () => {
    const n = randInt(1000, 9999) / 1000;
    const rounded = Math.round(n * 10) / 10;
    return base("g5_decimal_round", 2, {
      promptText: `Làm tròn ${n.toFixed(3).replace(".", ",")} đến hàng phần mười`,
      options: shuffle([String(rounded), String(rounded + 0.1), String(rounded - 0.1), String(Math.round(n))]),
      answer: String(rounded),
      explanation: `Làm tròn → ${rounded}`,
    });
  },

  g5_measure_length: (d) => {
    const m = randInt(2, d === 1 ? 8 : 15);
    const answer = m * 100;
    return base("g5_measure_length", d, {
      promptText: `${m} m = ? cm`,
      ...mcqNumber(answer, 50),
      explanation: `1 m = 100 cm → ${answer} cm`,
    });
  },

  g5_measure_mass: (d) => {
    const kg = randInt(1, d === 1 ? 5 : 9);
    const g = randInt(100, 900);
    const answer = kg * 1000 + g;
    return base("g5_measure_mass", d, {
      promptText: `${kg} kg ${g} g = ? g`,
      ...mcqNumber(answer, 200),
      explanation: `${kg} kg = ${kg * 1000} g, cộng ${g} g → ${answer} g`,
    });
  },

  g5_measure_area_unit: (d) => {
    const m2 = randInt(1, d === 1 ? 5 : 10);
    const answer = m2 * 100;
    return base("g5_measure_area_unit", d, {
      promptText: `${m2} m² = ? dm²`,
      ...mcqNumber(answer, 50),
      explanation: `1 m² = 100 dm² → ${answer} dm²`,
    });
  },

  g5_measure_volume_unit: (d) => {
    const dm3 = randInt(2, d === 1 ? 6 : 12);
    const answer = dm3 * 1000;
    return base("g5_measure_volume_unit", d, {
      promptText: `${dm3} dm³ = ? cm³`,
      ...mcqNumber(answer, 500),
      explanation: `1 dm³ = 1000 cm³ → ${answer} cm³`,
    });
  },

  g5_measure_time: (d) => {
    const hours = randInt(1, 3);
    const minutes = randInt(10, 50);
    const answer = hours * 60 + minutes;
    return base("g5_measure_time", d, {
      promptText: `${hours} giờ ${minutes} phút = ? phút`,
      ...mcqNumber(answer, 30),
      explanation: `${hours} giờ = ${hours * 60} phút, cộng ${minutes} phút → ${answer} phút`,
    });
  },

  g5_ratio: () => {
    const a = randInt(4, 20) * 2;
    const b = randInt(2, 10) * 2;
    const g = gcd(a, b);
    const answer = `${a / g}:${b / g}`;
    return base("g5_ratio", 2, {
      promptText: `Tỉ số của ${a} và ${b} (rút gọn) là?`,
      ...mcqString(answer, [`${a}:${b}`, `${a / 2}:${b}`, `${a}:${b * 2}`]),
      explanation: `Tỉ số ${a}:${b} rút gọn = ${answer}`,
    });
  },

  g5_percent_concept: () => {
    const pct = [10, 25, 50, 75][randInt(0, 3)];
    const frac = pct === 25 ? "1/4" : pct === 50 ? "1/2" : pct === 75 ? "3/4" : "1/10";
    return base("g5_percent_concept", 2, {
      promptText: `Phân số ${frac} viết dưới dạng phần trăm là?`,
      ...mcqString(`${pct}%`, [`${pct + 5}%`, `${pct - 5}%`, `${pct * 2}%`]),
      explanation: `${frac} = ${pct}%`,
    });
  },

  g5_percent_problem: (d) => {
    const baseNum = randInt(20, d === 1 ? 100 : 200);
    const pct = [10, 20, 25, 50][randInt(0, d === 1 ? 1 : 3)];
    const answer = (baseNum * pct) / 100;
    return base("g5_percent_problem", d, {
      promptText: `${pct}% của ${baseNum} = ?`,
      ...mcqNumber(answer, 10),
      explanation: `${pct}% × ${baseNum} = ${answer}`,
    });
  },

  g5_geo_rect: (d) => {
    const w = randInt(3, d === 1 ? 8 : 15);
    const h = randInt(3, d === 1 ? 8 : 15);
    const isP = Math.random() > 0.5;
    const answer = isP ? 2 * (w + h) : w * h;
    return base("g5_geo_rect", d, {
      promptText: isP
        ? `Hình chữ nhật dài ${w}cm, rộng ${h}cm. Chu vi = ?`
        : `Hình chữ nhật dài ${w}cm, rộng ${h}cm. Diện tích = ?`,
      ...mcqNumber(answer, 8),
      explanation: isP ? `P = 2×(${w}+${h}) = ${answer}` : `S = ${w}×${h} = ${answer}`,
    });
  },

  g5_geo_square: (d) => {
    const a = randInt(3, d === 1 ? 10 : 15);
    const isP = Math.random() > 0.5;
    const answer = isP ? a * 4 : a * a;
    return base("g5_geo_square", d, {
      promptText: isP ? `Hình vuông cạnh ${a}cm. Chu vi = ?` : `Hình vuông cạnh ${a}cm. Diện tích = ?`,
      ...mcqNumber(answer, 8),
      explanation: isP ? `P = 4×${a} = ${answer}` : `S = ${a}×${a} = ${answer}`,
    });
  },

  g5_geo_triangle: (d) => {
    const baseLen = randInt(4, 12);
    const h = randInt(3, 10);
    const answer = (baseLen * h) / 2;
    return base("g5_geo_triangle", d, {
      promptText: `Tam giác đáy ${baseLen}cm, cao ${h}cm. Diện tích = ?`,
      ...mcqNumber(answer, 5),
      explanation: `S = (${baseLen}×${h})÷2 = ${answer} cm²`,
    });
  },

  g5_geo_trapezoid: (d) => {
    const a = randInt(4, 10);
    const b = randInt(6, 14);
    const h = randInt(3, 8);
    const answer = ((a + b) * h) / 2;
    return base("g5_geo_trapezoid", d, {
      promptText: `Hình thang đáy ${a}cm và ${b}cm, cao ${h}cm. Diện tích = ?`,
      ...mcqNumber(answer, 8),
      explanation: `S = (${a}+${b})×${h}÷2 = ${answer} cm²`,
    });
  },

  g5_geo_circle: (d) => {
    const r = randInt(2, d === 1 ? 5 : 10);
    const isArea = Math.random() > 0.5;
    const answer = isArea ? Math.round(r * r * 314) / 100 : Math.round(2 * r * 314) / 100;
    return base("g5_geo_circle", d, {
      promptText: isArea
        ? `Hình tròn bán kính ${r}cm. Diện tích ≈ ? (π = 3,14)`
        : `Hình tròn bán kính ${r}cm. Chu vi ≈ ? (π = 3,14)`,
      ...mcqNumber(answer, 5),
      explanation: isArea ? `S ≈ ${r}×${r}×3,14 = ${answer}` : `C ≈ 2×${r}×3,14 = ${answer}`,
    });
  },

  g5_geo_box: (d) => {
    const a = randInt(3, 8);
    const b = randInt(3, 8);
    const c = randInt(2, 6);
    const isVol = Math.random() > 0.5;
    const answer = isVol ? a * b * c : 2 * (a * b + b * c + a * c);
    return base("g5_geo_box", d, {
      promptText: isVol
        ? `Hộp chữ nhật ${a}×${b}×${c} cm. Thể tích = ?`
        : `Hộp chữ nhật ${a}×${b}×${c} cm. Diện tích toàn phần = ?`,
      ...mcqNumber(answer, 20),
      explanation: isVol ? `V = ${a}×${b}×${c} = ${answer}` : `S = 2×(${a*b}+${b*c}+${a*c}) = ${answer}`,
    });
  },

  g5_geo_cube: (d) => {
    const a = randInt(3, d === 1 ? 6 : 10);
    const isVol = Math.random() > 0.5;
    const answer = isVol ? a ** 3 : 6 * a * a;
    return base("g5_geo_cube", d, {
      promptText: isVol ? `Hình lập phương cạnh ${a}cm. Thể tích = ?` : `Hình lập phương cạnh ${a}cm. Diện tích toàn phần = ?`,
      ...mcqNumber(answer, 15),
      explanation: isVol ? `V = ${a}³ = ${answer}` : `S = 6×${a}² = ${answer}`,
    });
  },

  g5_motion_speed: () => {
    const pair = [
      [5, 18],
      [10, 36],
    ][randInt(0, 1)] as [number, number];
    const toKmh = Math.random() > 0.5;
    return base("g5_motion_speed", 2, {
      promptText: toKmh ? `${pair[0]} m/giây = ? km/giờ` : `${pair[1]} km/giờ = ? m/giây`,
      ...mcqNumber(toKmh ? pair[1] : pair[0], 5),
      explanation: toKmh ? `1 m/giây = 3,6 km/giờ` : `1 km/giờ = 1000/3600 m/giây`,
    });
  },

  g5_motion_distance: () => {
    const v = randInt(4, 12);
    const t = randInt(2, 5);
    const answer = v * t;
    return base("g5_motion_distance", 2, {
      promptText: `Xe chạy ${v} km/giờ trong ${t} giờ. Quãng đường = ? km`,
      ...mcqNumber(answer, 5),
      explanation: `s = v × t = ${v} × ${t} = ${answer} km`,
    });
  },

  g5_motion_time: () => {
    const v = randInt(4, 10);
    const s = v * randInt(2, 6);
    const answer = s / v;
    return base("g5_motion_time", 2, {
      promptText: `Đi ${s} km với vận tốc ${v} km/giờ. Thời gian = ? giờ`,
      ...mcqNumber(answer, 2),
      explanation: `t = s ÷ v = ${s} ÷ ${v} = ${answer} giờ`,
    });
  },

  g5_motion_problem: (d) => {
    const v1 = randInt(30, 50);
    const v2 = randInt(20, 40);
    const t = randInt(1, d === 1 ? 2 : 3);
    const answer = (v1 + v2) * t;
    return base("g5_motion_problem", d, {
      promptText: `Hai xe chạy ngược chiều, vận tốc ${v1} và ${v2} km/giờ. Sau ${t} giờ quãng cách = ? km`,
      ...mcqNumber(answer, 20),
      explanation: `Tổng vận tốc ${v1 + v2} km/giờ × ${t} giờ = ${answer} km`,
    });
  },

  g5_word_sum_diff: () => {
    const sum = randInt(40, 100);
    const diff = randInt(4, 20);
    const larger = (sum + diff) / 2;
    return base("g5_word_sum_diff", 2, {
      promptText: `Tổng hai số là ${sum}, hiệu là ${diff}. Số lớn hơn là?`,
      ...mcqNumber(larger, 5),
      explanation: `Số lớn = (tổng + hiệu) ÷ 2 = (${sum}+${diff})÷2 = ${larger}`,
    });
  },

  g5_word_sum_ratio: () => {
    const ratio = [2, 3, 4][randInt(0, 2)];
    const unit = randInt(5, 15);
    const sum = unit * (1 + ratio);
    const answer = unit * ratio;
    return base("g5_word_sum_ratio", 2, {
      promptText: `Tổng hai số là ${sum}, tỉ số ${ratio}:1. Số lớn hơn là?`,
      ...mcqNumber(answer, 5),
      explanation: `Tổng ${ratio}+1 phần = ${sum} → 1 phần = ${unit}, số lớn = ${answer}`,
    });
  },

  g5_word_diff_ratio: () => {
    const ratio = [3, 4, 5][randInt(0, 2)];
    const diff = ratio * randInt(3, 8);
    const answer = (diff * ratio) / (ratio - 1);
    return base("g5_word_diff_ratio", 2, {
      promptText: `Hiệu hai số là ${diff}, tỉ ${ratio}:1. Số lớn hơn là?`,
      ...mcqNumber(answer, 5),
      explanation: `Hiệu ${ratio}-1 = ${ratio - 1} phần = ${diff} → số lớn = ${answer}`,
    });
  },

  g5_word_productivity: () => {
    const rate = randInt(4, 10);
    const hours = randInt(3, 6);
    const answer = rate * hours;
    return base("g5_word_productivity", 2, {
      promptText: `Một người làm ${rate} sản phẩm/giờ. Trong ${hours} giờ làm được bao nhiêu sản phẩm?`,
      ...mcqNumber(answer, 5),
      explanation: `${rate} × ${hours} = ${answer} sản phẩm`,
    });
  },

  g5_word_proportion: () => {
    const x = randInt(2, 5);
    const answer = x * 4;
    return base("g5_word_proportion", 2, {
      promptText: `5 quyển vở giá 20.000đ. ${x} quyển cùng loại giá bao nhiêu nghìn đồng?`,
      ...mcqNumber(answer, 4),
      explanation: `Tỉ lệ thuận: 5 quyển → 20k, ${x} quyển → ${answer}k`,
    });
  },

  g5_word_age: () => {
    const child = randInt(8, 12);
    const diff = randInt(24, 30);
    const mom = child + diff;
    return base("g5_word_age", 2, {
      promptText: `Con ${child} tuổi, mẹ hơn con ${diff} tuổi. Mẹ bao nhiêu tuổi?`,
      ...mcqNumber(mom, 3),
      explanation: `Mẹ = ${child} + ${diff} = ${mom} tuổi`,
    });
  },

  g5_thinking_sequence: () => {
    const start = randInt(2, 5);
    const step = randInt(2, 5);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = start + 4 * step;
    return base("g5_thinking_sequence", 2, {
      promptText: `Dãy số: ${seq.join(", ")}, ... Số tiếp theo là?`,
      ...mcqNumber(answer, step + 2),
      explanation: `Quy luật cộng ${step} mỗi lần → ${answer}`,
    });
  },

  g5_thinking_logic: () => {
    const items = [
      { q: "Số vừa chia hết cho 2 vừa chia hết cho 5 là?", a: "10", w: ["12", "15", "8"] },
      { q: "Hình có 4 cạnh bằng nhau và 4 góc vuông là?", a: "Hình vuông", w: ["Hình thoi", "Hình chữ nhật", "Tam giác"] },
    ];
    const item = items[randInt(0, items.length - 1)];
    return base("g5_thinking_logic", 2, {
      promptText: item.q,
      ...mcqString(item.a, item.w),
      explanation: `Đáp án: ${item.a}`,
    });
  },

  g5_thinking_count: () => {
    const n = randInt(3, 5);
    const answer = (n * (n + 1)) / 2;
    return base("g5_thinking_count", 2, {
      promptText: `Hình tam giác chia thành ${n} hàng đều. Tổng số tam giác nhỏ nhất = ?`,
      ...mcqNumber(answer, 3),
      explanation: `1+2+...+${n} = ${answer} tam giác`,
    });
  },

  g5_thinking_multi: () => {
    const boxes = randInt(2, 5);
    const each = randInt(3, 8);
    const extra = randInt(2, 4);
    const answer = boxes * each + extra;
    return base("g5_thinking_multi", 2, {
      promptText: `Có ${boxes} hộp, mỗi hộp ${each} bút, thêm ${extra} bút lẻ. Tổng số bút là?`,
      ...mcqNumber(answer, 3),
      explanation: `${boxes}×${each} + ${extra} = ${answer} bút`,
    });
  },

  g5_thinking_trial: () => {
    const answer = 7;
    return base("g5_thinking_trial", 2, {
      promptText: `Số nào nhân với 3 rồi cộng 4 bằng 25?`,
      ...mcqNumber(answer, 3),
      explanation: `Thử: 7×3+4 = 25`,
    });
  },

  g5_thinking_olympiad: () => {
    const n = randInt(10, 30);
    const answer = n * (n + 1) / 2;
    return base("g5_thinking_olympiad", 3, {
      promptText: `Tính nhanh: 1 + 2 + 3 + ... + ${n} = ?`,
      ...mcqNumber(answer, 10),
      explanation: `Công thức: n×(n+1)÷2 = ${n}×${n + 1}÷2 = ${answer}`,
    });
  },
};

export function generateGrade5Question(topicId: Grade5TopicId, difficulty: Difficulty): MathQuestion {
  const gen = GENERATORS[topicId];
  return gen(difficulty);
}
