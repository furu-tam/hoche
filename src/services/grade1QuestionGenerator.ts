import type { Grade1TopicId } from "@/types/grade1Curriculum";
import { getGrade1TopicLabel } from "@/types/grade1Curriculum";
import type { Difficulty, MathQuestion } from "@/types/question";
import { mcqNumber, mcqString, randInt, shuffle } from "@/utils/questionUtils";

const NUMBER_WORDS: Record<number, string> = {
  0: "không",
  1: "một",
  2: "hai",
  3: "ba",
  4: "bốn",
  5: "năm",
  6: "sáu",
  7: "bảy",
  8: "tám",
  9: "chín",
  10: "mười",
};

function base(
  topicId: Grade1TopicId,
  difficulty: Difficulty,
  partial: Omit<MathQuestion, "type" | "topicId" | "topicLabel" | "module" | "difficulty">
): MathQuestion {
  return {
    type: "math",
    module: "addition",
    topicId,
    topicLabel: getGrade1TopicLabel(topicId),
    difficulty,
    ...partial,
  };
}

function addWithin(max: number, d: Difficulty) {
  const cap = d === 1 ? Math.min(5, max) : max;
  const a = randInt(1, cap - 1);
  const b = randInt(1, cap - a);
  return { a, b, answer: a + b };
}

function subWithin(max: number, d: Difficulty) {
  const cap = d === 1 ? Math.min(5, max) : max;
  const a = randInt(2, cap);
  const b = randInt(1, a - 1);
  return { a, b, answer: a - b };
}

const GENERATORS: Record<Grade1TopicId, (d: Difficulty) => MathQuestion> = {
  g1_num_recognize_small: (d) => {
    const n = randInt(0, d === 1 ? 5 : 10);
    const useWord = Math.random() > 0.5;
    return base("g1_num_recognize_small", d, {
      promptText: useWord ? `Số "${NUMBER_WORDS[n]}" là số nào?` : `Số nào đọc là "${NUMBER_WORDS[n]}"?`,
      ...mcqNumber(n, 2),
      explanation: `Số ${n} đọc là "${NUMBER_WORDS[n]}".`,
    });
  },

  g1_num_recognize_medium: (d) => {
    const n = randInt(11, d === 1 ? 15 : 20);
    return base("g1_num_recognize_medium", d, {
      promptText: `Số nào là số mười ${NUMBER_WORDS[n - 10]}?`,
      ...mcqNumber(n, 3),
      explanation: `Mười ${NUMBER_WORDS[n - 10]} = ${n}.`,
    });
  },

  g1_num_recognize_100: (d) => {
    const tens = randInt(1, d === 1 ? 5 : 9) * 10;
    return base("g1_num_recognize_100", d, {
      promptText: `Số "${tens}" gồm mấy chục?`,
      ...mcqNumber(tens / 10, 2),
      explanation: `${tens} = ${tens / 10} chục.`,
    });
  },

  g1_num_count_forward: (d) => {
    const start = randInt(0, d === 1 ? 5 : 15);
    const answer = start + 1;
    return base("g1_num_count_forward", d, {
      promptText: `Đếm xuôi: ${start}, ...`,
      ...mcqNumber(answer, 2),
      explanation: `Sau ${start} là ${answer}.`,
    });
  },

  g1_num_count_backward: (d) => {
    const start = randInt(3, d === 1 ? 8 : 15);
    const answer = start - 1;
    return base("g1_num_count_backward", d, {
      promptText: `Đếm ngược: ${start}, ...`,
      ...mcqNumber(answer, 2),
      explanation: `Trước ${start} là ${answer}.`,
    });
  },

  g1_num_count_group: (d) => {
    const groups = randInt(2, d === 1 ? 3 : 4);
    const each = randInt(2, 5);
    const answer = groups * each;
    return base("g1_num_count_group", d, {
      promptText: `${groups} nhóm, mỗi nhóm ${each} quả. Tổng bao nhiêu quả?`,
      ...mcqNumber(answer, 3),
      explanation: `${groups} × ${each} = ${answer} quả.`,
    });
  },

  g1_num_write: (d) => {
    const n = randInt(1, d === 1 ? 9 : 20);
    return base("g1_num_write", d, {
      promptText: `Viết số: ${NUMBER_WORDS[n]}`,
      ...mcqNumber(n, 2),
      explanation: `"${NUMBER_WORDS[n]}" viết là ${n}.`,
    });
  },

  g1_num_write_missing: (d) => {
    const seq = [randInt(1, 4), randInt(5, 7), randInt(8, 9)];
    const answer = seq[2] + 1;
    return base("g1_num_write_missing", d, {
      promptText: `Điền số: ${seq.join(", ")}, □`,
      ...mcqNumber(answer, 2),
      explanation: `Dãy tăng 1 → điền ${answer}.`,
    });
  },

  g1_num_compare: (d) => {
    const max = d === 1 ? 10 : 20;
    const a = randInt(1, max);
    let b = a + randInt(-3, 3);
    if (b === a) b += 1;
    b = Math.max(0, Math.min(max, b));
    const answer = a > b ? ">" : a < b ? "<" : "=";
    return base("g1_num_compare", d, {
      promptText: `${a} □ ${b}`,
      options: shuffle([">", "<", "="]),
      answer,
      explanation: `${a} ${answer} ${b}`,
    });
  },

  g1_num_sort: (d) => {
    const nums = shuffle([randInt(2, 8), randInt(2, 8), randInt(2, 8)]);
    const answer = [...nums].sort((x, y) => x - y).join(", ");
    return base("g1_num_sort", d, {
      promptText: `Sắp xếp tăng dần: ${nums.join(", ")}`,
      ...mcqString(answer, [nums.reverse().join(", "), shuffle(nums).join(", "), nums.sort().reverse().join(", ")]),
      explanation: `Thứ tự tăng: ${answer}`,
    });
  },

  g1_add_5: (d) => {
    const { a, b, answer } = addWithin(5, d);
    return base("g1_add_5", d, {
      promptText: `${a} + ${b} = ?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} + ${b} = ${answer}`,
    });
  },

  g1_add_10: (d) => {
    const { a, b, answer } = addWithin(10, d);
    return base("g1_add_10", d, {
      promptText: `${a} + ${b} = ?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} + ${b} = ${answer}`,
    });
  },

  g1_add_split: (d) => {
    const total = randInt(3, d === 1 ? 6 : 10);
    const part = randInt(1, total - 1);
    const answer = total - part;
    return base("g1_add_split", d, {
      promptText: `Tách ${total} thành ${part} và ...?`,
      ...mcqNumber(answer, 2),
      explanation: `${part} + ${answer} = ${total}`,
    });
  },

  g1_add_missing: (d) => {
    const { a, b, answer } = addWithin(10, d);
    return base("g1_add_missing", d, {
      promptText: `${a} + □ = ${answer}`,
      ...mcqNumber(b, 2),
      explanation: `${a} + ${b} = ${answer}`,
    });
  },

  g1_add_word: (d) => {
    const have = randInt(2, d === 1 ? 5 : 8);
    const more = randInt(1, d === 1 ? 3 : 5);
    const answer = have + more;
    return base("g1_add_word", d, {
      promptText: `Lan có ${have} kẹo, mẹ cho thêm ${more} cái. Lan có bao nhiêu kẹo?`,
      ...mcqNumber(answer, 2),
      explanation: `${have} + ${more} = ${answer}`,
    });
  },

  g1_sub_5: (d) => {
    const { a, b, answer } = subWithin(5, d);
    return base("g1_sub_5", d, {
      promptText: `${a} − ${b} = ?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} − ${b} = ${answer}`,
    });
  },

  g1_sub_10: (d) => {
    const { a, b, answer } = subWithin(10, d);
    return base("g1_sub_10", d, {
      promptText: `${a} − ${b} = ?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} − ${b} = ${answer}`,
    });
  },

  g1_sub_takeaway: (d) => {
    const total = randInt(4, d === 1 ? 7 : 10);
    const take = randInt(1, total - 1);
    const answer = total - take;
    return base("g1_sub_takeaway", d, {
      promptText: `Có ${total} bóng, bớt ${take} quả. Còn lại?`,
      ...mcqNumber(answer, 2),
      explanation: `${total} − ${take} = ${answer}`,
    });
  },

  g1_sub_missing: (d) => {
    const { a, b, answer } = subWithin(10, d);
    return base("g1_sub_missing", d, {
      promptText: `□ − ${b} = ${answer}`,
      ...mcqNumber(a, 2),
      explanation: `${a} − ${b} = ${answer}`,
    });
  },

  g1_sub_word: (d) => {
    const have = randInt(5, d === 1 ? 8 : 10);
    const eat = randInt(1, have - 1);
    const answer = have - eat;
    return base("g1_sub_word", d, {
      promptText: `Có ${have} táo, ăn ${eat} quả. Còn lại?`,
      ...mcqNumber(answer, 2),
      explanation: `${have} − ${eat} = ${answer}`,
    });
  },

  g1_hundred_read: (d) => {
    const tens = randInt(1, d === 1 ? 5 : 9);
    const ones = randInt(0, 9);
    const n = tens * 10 + ones;
    return base("g1_hundred_read", d, {
      promptText: `Số gồm ${tens} chục và ${ones} đơn vị là?`,
      ...mcqNumber(n, 5),
      explanation: `${tens} chục ${ones} đơn vị = ${n}`,
    });
  },

  g1_hundred_structure: (d) => {
    const n = randInt(11, d === 1 ? 50 : 99);
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return base("g1_hundred_structure", d, {
      promptText: `Số ${n} có bao nhiêu chục?`,
      ...mcqNumber(tens, 2),
      explanation: `${n} = ${tens} chục ${ones} đơn vị`,
    });
  },

  g1_hundred_compare: (d) => {
    const a = randInt(20, d === 1 ? 60 : 90);
    let b = a + randInt(-10, 10);
    if (b === a) b += 5;
    b = Math.max(10, Math.min(99, b));
    const answer = a > b ? ">" : "<";
    return base("g1_hundred_compare", d, {
      promptText: `${a} □ ${b}`,
      options: shuffle([">", "<", "="]),
      answer,
      explanation: `${a} ${answer} ${b}`,
    });
  },

  g1_hundred_neighbor: (d) => {
    const n = randInt(11, d === 1 ? 50 : 99);
    const after = Math.random() > 0.5;
    const answer = after ? n + 1 : n - 1;
    return base("g1_hundred_neighbor", d, {
      promptText: after ? `Số liền sau của ${n} là?` : `Số liền trước của ${n} là?`,
      ...mcqNumber(answer, 2),
      explanation: after ? `Liền sau ${n} là ${answer}` : `Liền trước ${n} là ${answer}`,
    });
  },

  g1_calc_add_100: (d) => {
    const tensA = randInt(1, d === 1 ? 4 : 8) * 10;
    const tensB = randInt(1, d === 1 ? 4 : 8) * 10;
    const answer = tensA + tensB;
    return base("g1_calc_add_100", d, {
      promptText: `${tensA} + ${tensB} = ?`,
      ...mcqNumber(answer, 10),
      explanation: `${tensA} + ${tensB} = ${answer}`,
    });
  },

  g1_calc_sub_100: (d) => {
    const a = randInt(3, d === 1 ? 7 : 9) * 10;
    const b = randInt(1, a / 10 - 1) * 10;
    const answer = a - b;
    return base("g1_calc_sub_100", d, {
      promptText: `${a} − ${b} = ?`,
      ...mcqNumber(answer, 10),
      explanation: `${a} − ${b} = ${answer}`,
    });
  },

  g1_calc_mental: (d) => {
    const a = randInt(2, d === 1 ? 5 : 9);
    const b = 10 - a;
    return base("g1_calc_mental", d, {
      promptText: `Tính nhẩm: ${a} + ${b} = ?`,
      ...mcqNumber(10, 2),
      explanation: `${a} + ${b} = 10 (bạn bằng 10)`,
    });
  },

  g1_calc_sign: (d) => {
    const { a, b, answer } = addWithin(10, d);
    const other = answer + randInt(1, 3);
    const sign = answer > other ? ">" : "<";
    return base("g1_calc_sign", d, {
      promptText: `${a} + ${b} □ ${other}`,
      options: shuffle([">", "<", "="]),
      answer: sign,
      explanation: `${a} + ${b} = ${answer}, so sánh với ${other}`,
    });
  },

  g1_geo_recognize: () => {
    const items = [
      { q: "Hình nào có 3 cạnh?", a: "Tam giác", w: ["Vuông", "Tròn", "Chữ nhật"] },
      { q: "Hình nào có 4 cạnh bằng nhau?", a: "Hình vuông", w: ["Tam giác", "Tròn", "Chữ nhật"] },
      { q: "Hình tròn có mấy cạnh?", a: "0", w: ["3", "4", "2"] },
      { q: "Hình chữ nhật có mấy cạnh?", a: "4", w: ["3", "0", "6"] },
    ];
    const item = items[randInt(0, items.length - 1)];
    return base("g1_geo_recognize", 1, {
      promptText: item.q,
      ...mcqString(item.a, item.w),
      explanation: `Đáp án: ${item.a}`,
    });
  },

  g1_geo_puzzle: () => {
    const answer = "Hình vuông";
    return base("g1_geo_puzzle", 1, {
      promptText: "Ghép 2 tam giác vuông có thể tạo hình gì?",
      ...mcqString(answer, ["Hình tròn", "Tam giác", "Ngôi sao"]),
      explanation: "2 tam giác vuông ghép được hình vuông hoặc chữ nhật.",
    });
  },

  g1_geo_count: (d) => {
    const answer = randInt(2, d === 1 ? 4 : 6);
    return base("g1_geo_count", d, {
      promptText: `Có ${answer} hình tam giác giống nhau. Đếm được bao nhiêu?`,
      ...mcqNumber(answer, 2),
      explanation: `Có ${answer} hình tam giác.`,
    });
  },

  g1_geo_spatial: () => {
    const items = [
      { q: "Mèo ở bên trái chó. Chó ở bên nào mèo?", a: "Phải", w: ["Trái", "Trên", "Dưới"] },
      { q: "Chim bay trên cây. Cây ở đâu so với chim?", a: "Dưới", w: ["Trên", "Trong", "Ngoài"] },
      { q: "Bóng ở trong hộp. Hộp ở đâu so với bóng?", a: "Ngoài", w: ["Trong", "Trên", "Dưới"] },
    ];
    const item = items[randInt(0, items.length - 1)];
    return base("g1_geo_spatial", 1, {
      promptText: item.q,
      ...mcqString(item.a, item.w),
      explanation: `Đáp án: ${item.a}`,
    });
  },

  g1_measure_length: () => {
    const a = randInt(3, 9);
    const b = a + randInt(2, 5);
    return base("g1_measure_length", 1, {
      promptText: `Que dài ${b}cm và que dài ${a}cm. Que nào dài hơn?`,
      ...mcqString(String(b), [String(a), "Bằng nhau", String(a + 1)]),
      explanation: `${b}cm > ${a}cm`,
    });
  },

  g1_measure_time_period: () => {
    const items = [
      { q: "Buổi ăn trưa là buổi nào?", a: "Trưa", w: ["Sáng", "Chiều", "Tối"] },
      { q: "Buổi đi học sáng sớm là?", a: "Sáng", w: ["Trưa", "Tối", "Chiều"] },
      { q: "Buổi ngủ sau 8 giờ tối thường là?", a: "Tối", w: ["Sáng", "Trưa", "Chiều"] },
    ];
    const item = items[randInt(0, items.length - 1)];
    return base("g1_measure_time_period", 1, {
      promptText: item.q,
      ...mcqString(item.a, item.w),
      explanation: `Đáp án: ${item.a}`,
    });
  },

  g1_measure_clock: (d) => {
    const hour = randInt(1, d === 1 ? 6 : 12);
    return base("g1_measure_clock", d, {
      promptText: `Kim dài chỉ số ${hour}, kim ngắn chỉ số 12. Mấy giờ?`,
      ...mcqNumber(hour, 2),
      explanation: `Giờ đúng: ${hour} giờ`,
    });
  },

  g1_measure_money: (d) => {
    const coins = d === 1 ? [2000, 2000] : [2000, 2000, 1000];
    const answer = coins.reduce((s, c) => s + c, 0);
    return base("g1_measure_money", d, {
      promptText: `Có ${coins.map((c) => c / 1000 + ".000đ").join(" và ")}. Tổng bao nhiêu nghìn?`,
      ...mcqNumber(answer / 1000, 2),
      explanation: `Tổng = ${answer / 1000}.000đ`,
    });
  },

  g1_word_add: (d) => {
    const a = randInt(2, d === 1 ? 5 : 8);
    const b = randInt(1, 4);
    const answer = a + b;
    return base("g1_word_add", d, {
      promptText: `Nam có ${a} ô tô, được tặng thêm ${b} chiếc. Nam có mấy chiếc?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} + ${b} = ${answer}`,
    });
  },

  g1_word_sub: (d) => {
    const a = randInt(5, d === 1 ? 8 : 10);
    const b = randInt(1, a - 1);
    const answer = a - b;
    return base("g1_word_sub", d, {
      promptText: `Có ${a} bông hoa, hái ${b} bông. Còn lại?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} − ${b} = ${answer}`,
    });
  },

  g1_word_compare: (d) => {
    const a = randInt(3, d === 1 ? 7 : 10);
    const b = a + randInt(1, 4);
    const diff = b - a;
    return base("g1_word_compare", d, {
      promptText: `Hùng có ${b} viên bi, Minh có ${a} viên. Hùng nhiều hơn bao nhiêu?`,
      ...mcqNumber(diff, 2),
      explanation: `${b} − ${a} = ${diff}`,
    });
  },

  g1_word_total: (d) => {
    const a = randInt(2, d === 1 ? 5 : 8);
    const b = randInt(2, d === 1 ? 5 : 8);
    const answer = a + b;
    return base("g1_word_total", d, {
      promptText: `Nhóm A có ${a} bút, nhóm B có ${b} bút. Cả hai nhóm có bao nhiêu bút?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} + ${b} = ${answer}`,
    });
  },

  g1_logic_pattern: (d) => {
    const start = randInt(1, d === 1 ? 3 : 5);
    const step = 1;
    const seq = [start, start + step, start + 2 * step];
    const answer = start + 3 * step;
    return base("g1_logic_pattern", d, {
      promptText: `Tìm quy luật: ${seq.join(", ")}, ...`,
      ...mcqNumber(answer, 2),
      explanation: `Mỗi lần thêm ${step} → ${answer}`,
    });
  },

  g1_logic_shape: () => {
    const patterns = ["🔴", "🔵", "🔴", "🔵"];
    return base("g1_logic_shape", 1, {
      promptText: `Điền hình tiếp: ${patterns.join(" ")} ...`,
      ...mcqString("🔴", ["🔵", "🟢", "🟡"]),
      explanation: "Quy luật xen kẽ đỏ – xanh → đỏ",
    });
  },

  g1_logic_classify: () => {
    const answer = "Theo màu sắc";
    return base("g1_logic_classify", 1, {
      promptText: "Nhóm: táo đỏ, cam, dâu đỏ. Nên phân loại theo?",
      ...mcqString(answer, ["Theo hình dạng", "Theo kích thước", "Theo vị trí"]),
      explanation: "Các quả có màu đỏ và cam — phân theo màu",
    });
  },

  g1_logic_path: () => {
    return base("g1_logic_path", 1, {
      promptText: "Đi thẳng 2 ô, rẽ phải 1 ô. Hướng cuối?",
      ...mcqString("Phải", ["Trái", "Lên", "Xuống"]),
      explanation: "Rẽ phải → hướng Phải",
    });
  },

  g1_adv_split: (d) => {
    const n = randInt(4, d === 1 ? 7 : 10);
    const a = randInt(1, n - 1);
    const answer = n - a;
    return base("g1_adv_split", d, {
      promptText: `Số ${n} có thể tách thành ${a} và ...?`,
      ...mcqNumber(answer, 2),
      explanation: `${a} + ${answer} = ${n}`,
    });
  },

  g1_adv_compare: (d) => {
    const nums = shuffle([randInt(2, 9), randInt(2, 9), randInt(2, 9)]);
    const answer = Math.max(...nums);
    return base("g1_adv_compare", d, {
      promptText: `Số lớn nhất trong: ${nums.join(", ")}`,
      ...mcqNumber(answer, 2),
      explanation: `${answer} là số lớn nhất`,
    });
  },

  g1_adv_count: (d) => {
    const step = d === 1 ? 2 : 5;
    const start = step;
    const answer = start + step * 2;
    return base("g1_adv_count", d, {
      promptText: `Đếm bước ${step}: ${start}, ${start + step}, ...`,
      ...mcqNumber(answer, step),
      explanation: `Mỗi bước thêm ${step} → ${answer}`,
    });
  },

  g1_adv_real: (d) => {
    const price = 2000;
    const count = randInt(2, d === 1 ? 3 : 5);
    const answer = (price * count) / 1000;
    return base("g1_adv_real", d, {
      promptText: `Mỗi que kẹo ${price / 1000}.000đ, mua ${count} que hết bao nhiêu nghìn?`,
      ...mcqNumber(answer, 2),
      explanation: `${price / 1000} × ${count} = ${answer} nghìn đồng`,
    });
  },
};

export function generateGrade1Question(topicId: Grade1TopicId, difficulty: Difficulty): MathQuestion {
  return GENERATORS[topicId](difficulty);
}
