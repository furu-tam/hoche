import type { Grade, MathModule } from "@/types/curriculum";
import type { Difficulty, MathQuestion } from "@/types/question";

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
  }
}
