export type Grade = 1 | 2 | 3 | 4 | 5;

export type MathModule =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "comparison"
  | "fractions"
  | "geometry"
  | "word_problem"
  | "decimals"
  | "percent"
  | "unit_conversion";

export interface ModuleInfo {
  id: MathModule;
  label: string;
  icon: string;
  description: string;
  dailyCount: number;
}

/** 10 câu/ngày — phân bổ theo trọng tâm từng lớp */
export const GRADE_CURRICULUM: Record<Grade, ModuleInfo[]> = {
  1: [
    { id: "addition", label: "Cộng trong 10", icon: "➕", description: "Phép cộng cơ bản", dailyCount: 3 },
    { id: "subtraction", label: "Trừ trong 10", icon: "➖", description: "Phép trừ cơ bản", dailyCount: 3 },
    { id: "comparison", label: "So sánh số", icon: "⚖️", description: "Lớn hơn, nhỏ hơn, bằng", dailyCount: 2 },
    { id: "geometry", label: "Hình học", icon: "🔺", description: "Nhận biết hình cơ bản", dailyCount: 2 },
  ],
  2: [
    { id: "addition", label: "Cộng trong 100", icon: "➕", description: "Cộng không nhớ và có nhớ", dailyCount: 3 },
    { id: "subtraction", label: "Trừ trong 100", icon: "➖", description: "Trừ trong phạm vi 100", dailyCount: 3 },
    { id: "multiplication", label: "Bảng nhân", icon: "✖️", description: "Nhân 2, 3, 4, 5", dailyCount: 2 },
    { id: "comparison", label: "So sánh số", icon: "⚖️", description: "Thứ tự các số", dailyCount: 2 },
  ],
  3: [
    { id: "multiplication", label: "Bảng cửu chương", icon: "✖️", description: "Nhân từ 2 đến 9", dailyCount: 3 },
    { id: "division", label: "Phép chia", icon: "➗", description: "Chia trong bảng cửu chương", dailyCount: 3 },
    { id: "addition", label: "Cộng trong 1000", icon: "➕", description: "Cộng nhiều chữ số", dailyCount: 2 },
    { id: "fractions", label: "Phân số", icon: "🍕", description: "Phân số cơ bản", dailyCount: 2 },
  ],
  4: [
    { id: "multiplication", label: "Nhân nhiều chữ số", icon: "✖️", description: "Nhân 2–3 chữ số", dailyCount: 2 },
    { id: "division", label: "Chia có dư", icon: "➗", description: "Chia số lớn", dailyCount: 2 },
    { id: "fractions", label: "Phép tính phân số", icon: "🍕", description: "Cộng trừ phân số cùng mẫu", dailyCount: 2 },
    { id: "geometry", label: "Chu vi & diện tích", icon: "📐", description: "Hình chữ nhật, vuông", dailyCount: 2 },
    { id: "word_problem", label: "Bài toán có lời văn", icon: "📝", description: "Giải bài toán thực tế", dailyCount: 2 },
  ],
  5: [
    { id: "fractions", label: "Phân số nâng cao", icon: "🍕", description: "So sánh và rút gọn", dailyCount: 2 },
    { id: "decimals", label: "Số thập phân", icon: "🔢", description: "Cộng trừ số thập phân", dailyCount: 1 },
    { id: "percent", label: "Phần trăm", icon: "💯", description: "Tính phần trăm cơ bản", dailyCount: 1 },
    { id: "unit_conversion", label: "Đổi đơn vị", icon: "⚖️", description: "Độ dài, khối lượng, thời gian, vận tốc", dailyCount: 2 },
    { id: "geometry", label: "Hình học", icon: "📐", description: "Công thức chu vi, diện tích, thể tích", dailyCount: 2 },
    { id: "word_problem", label: "Bài toán nâng cao", icon: "📝", description: "Bài toán tổng hợp", dailyCount: 2 },
  ],
};

export const DAILY_QUESTION_COUNT = 10;

export function getModulesForGrade(grade: Grade): ModuleInfo[] {
  return GRADE_CURRICULUM[grade];
}

export const MODULE_LABELS: Record<MathModule, string> = {
  addition: "Phép cộng",
  subtraction: "Phép trừ",
  multiplication: "Phép nhân",
  division: "Phép chia",
  comparison: "So sánh số",
  fractions: "Phân số",
  geometry: "Hình học",
  word_problem: "Bài toán có lời văn",
  decimals: "Số thập phân",
  percent: "Phần trăm",
  unit_conversion: "Đổi đơn vị",
};
