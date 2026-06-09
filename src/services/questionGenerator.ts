import type { Grade, MathModule } from "@/types/curriculum";
import type { Grade1TopicId } from "@/types/grade1Curriculum";
import type { Grade5TopicId } from "@/types/grade5Curriculum";
import type { Difficulty, MathQuestion } from "@/types/question";
import { generateGrade1Question } from "@/services/grade1QuestionGenerator";
import { generateGrade5Question } from "@/services/grade5QuestionGenerator";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildMcq(answer: number | string, distractors: (number | string)[]): MathQuestion["options"] {
  const opts = shuffle([String(answer), ...distractors.map(String)]);
  return opts;
}

function uniqueDistractors(answer: number, count: number, maker: (i: number) => number): string[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < count && guard < 50) {
    const v = maker(guard);
    if (v !== answer && v >= 0) set.add(v);
    guard++;
  }
  return [...set].map(String);
}

function genAddition(grade: Grade, difficulty: Difficulty): MathQuestion {
  let a: number, b: number, answer: number;
  if (grade === 1) {
    const max = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
    a = randInt(1, max);
    b = randInt(1, max - a);
    answer = a + b;
  } else if (grade === 2) {
    const max = difficulty === 1 ? 50 : difficulty === 2 ? 80 : 99;
    a = randInt(10, max);
    b = randInt(1, max - a);
    answer = a + b;
  } else {
    const max = difficulty === 1 ? 500 : difficulty === 2 ? 800 : 999;
    a = randInt(100, max);
    b = randInt(10, max - a);
    answer = a + b;
  }
  return {
    type: "math",
    module: "addition",
    difficulty,
    promptText: `${a} + ${b} = ?`,
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-5, 5))),
    answer: String(answer),
    explanation: `${a} + ${b} = ${answer}`,
  };
}

function genSubtraction(grade: Grade, difficulty: Difficulty): MathQuestion {
  let a: number, b: number, answer: number;
  if (grade === 1) {
    const max = difficulty === 1 ? 8 : difficulty === 2 ? 10 : 10;
    a = randInt(2, max);
    b = randInt(1, a - 1);
    answer = a - b;
  } else {
    const max = difficulty === 1 ? 50 : difficulty === 2 ? 80 : 99;
    a = randInt(20, max);
    b = randInt(1, a - 1);
    answer = a - b;
  }
  return {
    type: "math",
    module: "subtraction",
    difficulty,
    promptText: `${a} − ${b} = ?`,
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-4, 4))),
    answer: String(answer),
    explanation: `${a} − ${b} = ${answer}`,
  };
}

function genMultiplication(grade: Grade, difficulty: Difficulty): MathQuestion {
  const tableMax = grade === 2 ? 5 : grade === 3 ? 9 : 12;
  const a = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? tableMax : tableMax);
  const b = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? 9 : 12);
  const answer = a * b;
  return {
    type: "math",
    module: "multiplication",
    difficulty,
    promptText: `${a} × ${b} = ?`,
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-10, 10))),
    answer: String(answer),
    explanation: `${a} × ${b} = ${answer}`,
  };
}

function genDivision(grade: Grade, difficulty: Difficulty): MathQuestion {
  const b = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? 9 : 12);
  const quotient = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? 9 : 12);
  const a = b * quotient;
  return {
    type: "math",
    module: "division",
    difficulty,
    promptText: `${a} ÷ ${b} = ?`,
    options: buildMcq(quotient, uniqueDistractors(quotient, 3, () => quotient + randInt(-3, 3))),
    answer: String(quotient),
    explanation: `${a} ÷ ${b} = ${quotient}`,
  };
}

function genComparison(grade: Grade, difficulty: Difficulty): MathQuestion {
  const max = grade === 1 ? 10 : grade === 2 ? 100 : 1000;
  const spread = difficulty === 1 ? 3 : difficulty === 2 ? 10 : 20;
  const a = randInt(1, max);
  let b = a + randInt(-spread, spread);
  if (b === a) b += randInt(1, 3);
  b = Math.max(0, Math.min(max, b));

  const answer = a > b ? ">" : a < b ? "<" : "=";
  const options = shuffle([">", "<", "="]);
  return {
    type: "math",
    module: "comparison",
    difficulty,
    promptText: `Điền dấu: ${a}  □  ${b}`,
    options,
    answer,
    explanation: `${a} ${answer} ${b}`,
  };
}

function genFractions(grade: Grade, difficulty: Difficulty): MathQuestion {
  if (grade <= 3) {
    const denom = randInt(2, difficulty === 1 ? 4 : 8);
    const num = randInt(1, denom - 1);
    const prompt = `Phân số nào bằng ${num}/${denom}?`;
    const correct = `${num}/${denom}`;
    const wrong = [
      `${num + 1}/${denom}`,
      `${num}/${denom + 1}`,
      `${Math.max(1, num - 1)}/${denom}`,
    ];
    return {
      type: "math",
      module: "fractions",
      difficulty,
      promptText: prompt,
      options: shuffle([correct, ...wrong.slice(0, 3)]),
      answer: correct,
      explanation: `${num}/${denom} là phân số đúng.`,
    };
  }

  const denom = randInt(2, 6);
  const n1 = randInt(1, denom - 1);
  const n2 = randInt(1, denom - 1);
  const sumNum = n1 + n2;
  const answer = `${sumNum}/${denom}`;
  return {
    type: "math",
    module: "fractions",
    difficulty,
    promptText: `${n1}/${denom} + ${n2}/${denom} = ?`,
    options: shuffle([answer, `${n1 + n2}/${denom + 1}`, `${n1}/${denom + n2}`, `${n2}/${denom}`]),
    answer,
    explanation: `Cùng mẫu số: ${n1}/${denom} + ${n2}/${denom} = ${answer}`,
  };
}

const GEOMETRY_FORMULAS: {
  prompt: string;
  answer: string;
  explanation: string;
  distractors: string[];
}[] = [
  {
    prompt: "Công thức tính chu vi hình vuông cạnh a là:",
    answer: "P = a × 4",
    explanation: "Chu vi hình vuông = 4 × cạnh = a × 4",
    distractors: ["P = a × a", "P = (a + b) × 2", "P = a + a + a"],
  },
  {
    prompt: "Công thức tính diện tích hình vuông cạnh a là:",
    answer: "S = a × a",
    explanation: "Diện tích hình vuông = cạnh × cạnh = a × a",
    distractors: ["S = a × 4", "S = (a + b) × 2", "S = a × 2"],
  },
  {
    prompt: "Công thức tính chu vi hình chữ nhật (dài a, rộng b) là:",
    answer: "P = (a + b) × 2",
    explanation: "Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2",
    distractors: ["P = a × b", "P = a + b", "P = a × 4"],
  },
  {
    prompt: "Công thức tính diện tích hình chữ nhật (dài a, rộng b) là:",
    answer: "S = a × b",
    explanation: "Diện tích hình chữ nhật = chiều dài × chiều rộng",
    distractors: ["S = (a + b) × 2", "S = a × a", "S = (a + b) ÷ 2"],
  },
  {
    prompt: "Công thức tính diện tích hình tam giác (đáy a, chiều cao h) là:",
    answer: "S = (a × h) ÷ 2",
    explanation: "Diện tích tam giác = (đáy × chiều cao) ÷ 2",
    distractors: ["S = a × h", "S = a + h", "S = (a + h) × 2"],
  },
  {
    prompt: "Công thức tính diện tích hình thoi (2 đường chéo d₁, d₂) là:",
    answer: "S = (d₁ × d₂) ÷ 2",
    explanation: "Diện tích hình thoi = (đường chéo 1 × đường chéo 2) ÷ 2",
    distractors: ["S = d₁ × d₂", "S = (d₁ + d₂) × 2", "S = d₁ + d₂"],
  },
  {
    prompt: "Công thức tính chu vi hình tròn (đường kính d) là:",
    answer: "C = d × 3,14",
    explanation: "Chu vi hình tròn = đường kính × π (lấy π ≈ 3,14)",
    distractors: ["C = d ÷ 3,14", "C = d × d", "C = d + d"],
  },
  {
    prompt: "Công thức tính diện tích hình tròn (bán kính r) là:",
    answer: "S = r × r × 3,14",
    explanation: "Diện tích hình tròn = bán kính × bán kính × π",
    distractors: ["S = r × 3,14", "S = r × r", "S = r × 4 × 3,14"],
  },
  {
    prompt: "Công thức tính thể tích hình lập phương cạnh a là:",
    answer: "V = a × a × a",
    explanation: "Thể tích hình lập phương = cạnh × cạnh × cạnh",
    distractors: ["V = a × a", "V = a × 6", "V = a × 4"],
  },
  {
    prompt: "Công thức tính thể tích hình hộp chữ nhật (dài a, rộng b, cao h) là:",
    answer: "V = a × b × h",
    explanation: "Thể tích hình hộp = dài × rộng × cao",
    distractors: ["V = a × b", "V = (a + b + h) × 2", "V = a + b + h"],
  },
];

function genGeometryFormula(difficulty: Difficulty): MathQuestion {
  const pool =
    difficulty === 1
      ? GEOMETRY_FORMULAS.slice(0, 4)
      : difficulty === 2
        ? GEOMETRY_FORMULAS.slice(0, 8)
        : GEOMETRY_FORMULAS;
  const item = pool[randInt(0, pool.length - 1)];
  return {
    type: "math",
    module: "geometry",
    difficulty,
    promptText: item.prompt,
    options: shuffle([item.answer, ...item.distractors.slice(0, 3)]),
    answer: item.answer,
    explanation: item.explanation,
  };
}

function genGeometryCalc(grade: Grade, difficulty: Difficulty): MathQuestion {
  if (grade === 5 && Math.random() > 0.5) {
    const side = randInt(2, difficulty === 1 ? 6 : 10);
    const isVolume = Math.random() > 0.5;
    if (isVolume) {
      const answer = side * side * side;
      return {
        type: "math",
        module: "geometry",
        difficulty,
        promptText: `Hình lập phương cạnh ${side}cm. Thể tích = ? (cm³)`,
        options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-20, 20))),
        answer: String(answer),
        explanation: `Thể tích = ${side} × ${side} × ${side} = ${answer} cm³`,
      };
    }
    const base = randInt(3, 10);
    const height = randInt(2, 8);
    const answer = (base * height) / 2;
    return {
      type: "math",
      module: "geometry",
      difficulty,
      promptText: `Tam giác đáy ${base}cm, cao ${height}cm. Diện tích = ? (cm²)`,
      options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-5, 5))),
      answer: String(answer),
      explanation: `Diện tích = (${base} × ${height}) ÷ 2 = ${answer} cm²`,
    };
  }

  const w = randInt(difficulty === 1 ? 2 : 4, difficulty === 1 ? 6 : 12);
  const h = randInt(difficulty === 1 ? 2 : 4, difficulty === 1 ? 6 : 12);
  const isPerimeter = Math.random() > 0.5;
  const answer = isPerimeter ? 2 * (w + h) : w * h;
  return {
    type: "math",
    module: "geometry",
    difficulty,
    promptText: isPerimeter
      ? `Hình chữ nhật dài ${w}cm, rộng ${h}cm. Chu vi = ?`
      : `Hình chữ nhật dài ${w}cm, rộng ${h}cm. Diện tích = ?`,
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-4, 4))),
    answer: String(answer),
    explanation: isPerimeter
      ? `Chu vi = 2 × (${w} + ${h}) = ${answer}`
      : `Diện tích = ${w} × ${h} = ${answer}`,
  };
}

function genGeometry(grade: Grade, difficulty: Difficulty): MathQuestion {
  if (grade === 1) {
    const shapes = [
      { q: "Hình nào có 3 cạnh?", a: "Tam giác", opts: ["Tam giác", "Vuông", "Tròn"] },
      { q: "Hình nào có 4 cạnh bằng nhau?", a: "Vuông", opts: ["Vuông", "Tam giác", "Tròn"] },
      { q: "Hình tròn có mấy cạnh?", a: "0", opts: ["0", "3", "4"] },
    ];
    const item = shapes[randInt(0, shapes.length - 1)];
    return {
      type: "math",
      module: "geometry",
      difficulty,
      promptText: item.q,
      options: shuffle(item.opts),
      answer: item.a,
      explanation: `Đáp án: ${item.a}`,
    };
  }

  if (grade === 5 && Math.random() > 0.45) {
    return genGeometryFormula(difficulty);
  }

  return genGeometryCalc(grade, difficulty);
}

type UnitConversionItem = { prompt: string; answer: number; explanation: string };

function genUnitConversion(difficulty: Difficulty): MathQuestion {
  const lengthWeight: (() => UnitConversionItem)[] = [
    () => {
      const km = randInt(1, difficulty === 1 ? 3 : 5);
      const m = randInt(100, 900);
      const answer = km * 1000 + m;
      return {
        prompt: `${km} km ${m} m = ? m`,
        answer,
        explanation: `${km} km = ${km * 1000} m, cộng ${m} m → ${answer} m`,
      };
    },
    () => {
      const m = randInt(2, difficulty === 1 ? 8 : 15);
      const answer = m * 100;
      return {
        prompt: `${m} m = ? cm`,
        answer,
        explanation: `1 m = 100 cm → ${m} m = ${answer} cm`,
      };
    },
    () => {
      const kg = randInt(1, difficulty === 1 ? 5 : 9);
      const g = randInt(100, 900);
      const answer = kg * 1000 + g;
      return {
        prompt: `${kg} kg ${g} g = ? g`,
        answer,
        explanation: `${kg} kg = ${kg * 1000} g, cộng ${g} g → ${answer} g`,
      };
    },
    () => {
      const tons = difficulty === 1 ? 1 : randInt(1, 3);
      const answer = tons * 1000;
      return {
        prompt: `${tons} tấn = ? kg`,
        answer,
        explanation: `1 tấn = 1000 kg → ${tons} tấn = ${answer} kg`,
      };
    },
    () => {
      const m2 = randInt(1, difficulty === 1 ? 5 : 10);
      const answer = m2 * 100;
      return {
        prompt: `${m2} m² = ? dm²`,
        answer,
        explanation: `1 m² = 100 dm² → ${m2} m² = ${answer} dm²`,
      };
    },
    () => {
      const liters = randInt(2, difficulty === 1 ? 8 : 15);
      const answer = liters * 1000;
      return {
        prompt: `${liters} l = ? ml`,
        answer,
        explanation: `1 l = 1000 ml → ${liters} l = ${answer} ml`,
      };
    },
    () => {
      const dm3 = randInt(2, difficulty === 1 ? 6 : 12);
      const answer = dm3 * 1000;
      return {
        prompt: `${dm3} dm³ = ? cm³`,
        answer,
        explanation: `1 dm³ = 1000 cm³ → ${dm3} dm³ = ${answer} cm³`,
      };
    },
  ];

  const time: (() => UnitConversionItem)[] = [
    () => {
      const hours = randInt(1, difficulty === 1 ? 3 : 5);
      const answer = hours * 60;
      return {
        prompt: `${hours} giờ = ? phút`,
        answer,
        explanation: `1 giờ = 60 phút → ${hours} giờ = ${answer} phút`,
      };
    },
    () => {
      const hours = randInt(1, 3);
      const minutes = randInt(10, 50);
      const answer = hours * 60 + minutes;
      return {
        prompt: `${hours} giờ ${minutes} phút = ? phút`,
        answer,
        explanation: `${hours} giờ = ${hours * 60} phút, cộng ${minutes} phút → ${answer} phút`,
      };
    },
    () => {
      const minutes = randInt(2, difficulty === 1 ? 10 : 20);
      const answer = minutes * 60;
      return {
        prompt: `${minutes} phút = ? giây`,
        answer,
        explanation: `1 phút = 60 giây → ${minutes} phút = ${answer} giây`,
      };
    },
    () => {
      const days = randInt(1, difficulty === 1 ? 2 : 4);
      const answer = days * 24;
      return {
        prompt: `${days} ngày = ? giờ`,
        answer,
        explanation: `1 ngày = 24 giờ → ${days} ngày = ${answer} giờ`,
      };
    },
    () => {
      const days = randInt(1, 2);
      const hours = randInt(1, 12);
      const answer = days * 24 + hours;
      return {
        prompt: `${days} ngày ${hours} giờ = ? giờ`,
        answer,
        explanation: `${days} ngày = ${days * 24} giờ, cộng ${hours} giờ → ${answer} giờ`,
      };
    },
    () => {
      const hours = randInt(1, 2);
      const answer = hours * 3600;
      return {
        prompt: `${hours} giờ = ? giây`,
        answer,
        explanation: `1 giờ = 3600 giây → ${hours} giờ = ${answer} giây`,
      };
    },
    () => {
      const hours = 1;
      const minutes = randInt(1, 3) * 30;
      const answer = hours * 3600 + minutes * 60;
      return {
        prompt: `${hours} giờ ${minutes} phút = ? giây`,
        answer,
        explanation: `${hours} giờ = 3600 giây, ${minutes} phút = ${minutes * 60} giây → ${answer} giây`,
      };
    },
  ];

  const speedPairs: [number, number][] = [
    [5, 18],
    [10, 36],
    [15, 54],
    [20, 72],
  ];

  const velocity: (() => UnitConversionItem)[] = [
    () => {
      const pair = speedPairs[randInt(0, difficulty === 1 ? 1 : speedPairs.length - 1)];
      const [ms, kmh] = pair;
      return {
        prompt: `${ms} m/giây = ? km/giờ`,
        answer: kmh,
        explanation: `1 m/giây = 3,6 km/giờ → ${ms} m/giây = ${kmh} km/giờ`,
      };
    },
    () => {
      const pair = speedPairs[randInt(0, speedPairs.length - 1)];
      const [ms, kmh] = pair;
      return {
        prompt: `${kmh} km/giờ = ? m/giây`,
        answer: ms,
        explanation: `1 km/giờ = 1000 m ÷ 3600 giây → ${kmh} km/giờ = ${ms} m/giây`,
      };
    },
    () => {
      const mpm = [60, 120, 180, 300, 600][randInt(0, difficulty === 1 ? 2 : 4)];
      const answer = mpm / 60;
      return {
        prompt: `${mpm} m/phút = ? m/giây`,
        answer,
        explanation: `1 phút = 60 giây → ${mpm} m/phút = ${mpm} ÷ 60 = ${answer} m/giây`,
      };
    },
    () => {
      const kmhOptions = [12, 30, 60];
      const kmh = kmhOptions[randInt(0, kmhOptions.length - 1)];
      const answer = (kmh * 1000) / 60;
      return {
        prompt: `${kmh} km/giờ = ? m/phút`,
        answer,
        explanation: `${kmh} km = ${kmh * 1000} m trong 60 phút → ${answer} m/phút`,
      };
    },
    () => {
      const ms = randInt(2, 8);
      const mpm = ms * 60;
      return {
        prompt: `${ms} m/giây = ? m/phút`,
        answer: mpm,
        explanation: `1 giây = 1/60 phút → ${ms} m/giây = ${ms} × 60 = ${mpm} m/phút`,
      };
    },
  ];

  const pools =
    difficulty === 1
      ? [...lengthWeight.slice(0, 3), ...time.slice(0, 2), ...velocity.slice(0, 1)]
      : difficulty === 2
        ? [...lengthWeight.slice(0, 5), ...time.slice(0, 5), ...velocity.slice(0, 3)]
        : [...lengthWeight, ...time, ...velocity];

  const t = pools[randInt(0, pools.length - 1)]();
  const spread = t.answer >= 1000 ? 500 : t.answer >= 100 ? 50 : 10;
  return {
    type: "math",
    module: "unit_conversion",
    difficulty,
    promptText: t.prompt,
    options: buildMcq(
      t.answer,
      uniqueDistractors(t.answer, 3, () => t.answer + randInt(-spread, spread))
    ),
    answer: String(t.answer),
    explanation: t.explanation,
  };
}

function genWordProblem(grade: Grade, difficulty: Difficulty): MathQuestion {
  const templates =
    grade === 4
      ? [
          () => {
            const apples = randInt(10, 30);
            const eaten = randInt(3, apples - 1);
            const ans = apples - eaten;
            return {
              prompt: `Lan có ${apples} quả táo, ăn ${eaten} quả. Còn lại bao nhiêu quả?`,
              ans,
              exp: `${apples} − ${eaten} = ${ans}`,
            };
          },
          () => {
            const boxes = randInt(3, 8);
            const each = randInt(4, 9);
            const ans = boxes * each;
            return {
              prompt: `Mỗi hộp có ${each} bút, có ${boxes} hộp. Tổng bao nhiêu bút?`,
              ans,
              exp: `${boxes} × ${each} = ${ans}`,
            };
          },
        ]
      : [
          () => {
            const total = randInt(50, 200);
            const spent = randInt(10, total - 10);
            const ans = total - spent;
            return {
              prompt: `Mẹ cho ${total}.000đ, mua sách hết ${spent}.000đ. Còn lại bao nhiêu nghìn?`,
              ans,
              exp: `${total} − ${spent} = ${ans} (nghìn đồng)`,
            };
          },
          () => {
            const students = randInt(20, 40);
            const pct = difficulty === 1 ? 50 : difficulty === 2 ? 25 : 20;
            const ans = (students * pct) / 100;
            return {
              prompt: `Lớp có ${students} học sinh, ${pct}% là nam. Có bao nhiêu học sinh nam?`,
              ans,
              exp: `${pct}% của ${students} = ${ans}`,
            };
          },
        ];

  const t = templates[randInt(0, templates.length - 1)]();
  return {
    type: "math",
    module: "word_problem",
    difficulty,
    promptText: t.prompt,
    options: buildMcq(t.ans, uniqueDistractors(t.ans, 3, () => t.ans + randInt(-5, 5))),
    answer: String(t.ans),
    explanation: t.exp,
  };
}

function genDecimals(difficulty: Difficulty): MathQuestion {
  const a = randInt(1, difficulty === 1 ? 9 : 20);
  const b = randInt(1, difficulty === 1 ? 9 : 20);
  const decA = a / 10;
  const decB = b / 10;
  const sum = Math.round((decA + decB) * 10) / 10;
  return {
    type: "math",
    module: "decimals",
    difficulty,
    promptText: `${decA} + ${decB} = ?`,
    options: shuffle([
      String(sum),
      String(sum + 0.1),
      String(Math.max(0, sum - 0.2)),
      String(sum + 0.3),
    ]),
    answer: String(sum),
    explanation: `${decA} + ${decB} = ${sum}`,
  };
}

function genPercent(difficulty: Difficulty): MathQuestion {
  const base = randInt(20, difficulty === 1 ? 100 : 200);
  const pct = difficulty === 1 ? 10 : difficulty === 2 ? 25 : 50;
  const answer = (base * pct) / 100;
  return {
    type: "math",
    module: "percent",
    difficulty,
    promptText: `${pct}% của ${base} = ?`,
    options: buildMcq(answer, uniqueDistractors(answer, 3, () => answer + randInt(-5, 5))),
    answer: String(answer),
    explanation: `${pct}% × ${base} = ${answer}`,
  };
}

export function generateQuestion(
  topicId: string,
  difficulty: Difficulty,
  grade: Grade
): MathQuestion {
  if (grade === 1 && topicId.startsWith("g1_")) {
    return generateGrade1Question(topicId as Grade1TopicId, difficulty);
  }
  if (grade === 5 && topicId.startsWith("g5_")) {
    return generateGrade5Question(topicId as Grade5TopicId, difficulty);
  }
  return generateMathQuestion(topicId as MathModule, difficulty, grade);
}

export function generateMathQuestion(
  module: MathModule,
  difficulty: Difficulty,
  grade: Grade
): MathQuestion {
  switch (module) {
    case "addition":
      return genAddition(grade, difficulty);
    case "subtraction":
      return genSubtraction(grade, difficulty);
    case "multiplication":
      return genMultiplication(grade, difficulty);
    case "division":
      return genDivision(grade, difficulty);
    case "comparison":
      return genComparison(grade, difficulty);
    case "fractions":
      return genFractions(grade, difficulty);
    case "geometry":
      return genGeometry(grade, difficulty);
    case "word_problem":
      return genWordProblem(grade, difficulty);
    case "decimals":
      return genDecimals(difficulty);
    case "percent":
      return genPercent(difficulty);
    case "unit_conversion":
      return genUnitConversion(difficulty);
  }
}
