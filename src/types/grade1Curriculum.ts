export type Grade1TopicId =
  | "g1_num_recognize_small"
  | "g1_num_recognize_medium"
  | "g1_num_recognize_100"
  | "g1_num_count_forward"
  | "g1_num_count_backward"
  | "g1_num_count_group"
  | "g1_num_write"
  | "g1_num_write_missing"
  | "g1_num_compare"
  | "g1_num_sort"
  | "g1_add_5"
  | "g1_add_10"
  | "g1_add_split"
  | "g1_add_missing"
  | "g1_add_word"
  | "g1_sub_5"
  | "g1_sub_10"
  | "g1_sub_takeaway"
  | "g1_sub_missing"
  | "g1_sub_word"
  | "g1_hundred_read"
  | "g1_hundred_structure"
  | "g1_hundred_compare"
  | "g1_hundred_neighbor"
  | "g1_calc_add_100"
  | "g1_calc_sub_100"
  | "g1_calc_mental"
  | "g1_calc_sign"
  | "g1_geo_recognize"
  | "g1_geo_puzzle"
  | "g1_geo_count"
  | "g1_geo_spatial"
  | "g1_measure_length"
  | "g1_measure_time_period"
  | "g1_measure_clock"
  | "g1_measure_money"
  | "g1_word_add"
  | "g1_word_sub"
  | "g1_word_compare"
  | "g1_word_total"
  | "g1_logic_pattern"
  | "g1_logic_shape"
  | "g1_logic_classify"
  | "g1_logic_path"
  | "g1_adv_split"
  | "g1_adv_compare"
  | "g1_adv_count"
  | "g1_adv_real";

export type TopicSkillGroup = "foundation" | "core" | "problem" | "advanced";

export interface Grade1Topic {
  id: Grade1TopicId;
  label: string;
  description: string;
  skillGroup: TopicSkillGroup;
}

export interface Grade1Chapter {
  id: string;
  label: string;
  icon: string;
  topics: Grade1Topic[];
}

export const GRADE1_CURRICULUM: Grade1Chapter[] = [
  {
    id: "numbers",
    label: "Làm quen với các số",
    icon: "🔢",
    topics: [
      { id: "g1_num_recognize_small", label: "Nhận biết số 0–10", description: "Đọc và nhận số trong phạm vi 10", skillGroup: "foundation" },
      { id: "g1_num_recognize_medium", label: "Nhận biết số 11–20", description: "Số từ 11 đến 20", skillGroup: "foundation" },
      { id: "g1_num_recognize_100", label: "Nhận biết số đến 100", description: "Số tròn chục và số đến 100", skillGroup: "foundation" },
      { id: "g1_num_count_forward", label: "Đếm xuôi", description: "Đếm tiếp theo thứ tự", skillGroup: "foundation" },
      { id: "g1_num_count_backward", label: "Đếm ngược", description: "Đếm lùi từ số cho trước", skillGroup: "foundation" },
      { id: "g1_num_count_group", label: "Đếm theo nhóm", description: "Đếm đồ vật theo từng nhóm", skillGroup: "foundation" },
      { id: "g1_num_write", label: "Viết số", description: "Viết số theo mẫu", skillGroup: "foundation" },
      { id: "g1_num_write_missing", label: "Viết số còn thiếu", description: "Điền số vào dãy", skillGroup: "foundation" },
      { id: "g1_num_compare", label: "So sánh số", description: "Lớn hơn, bé hơn, bằng", skillGroup: "foundation" },
      { id: "g1_num_sort", label: "Sắp xếp số", description: "Thứ tự tăng hoặc giảm dần", skillGroup: "foundation" },
    ],
  },
  {
    id: "add10",
    label: "Phép cộng trong phạm vi 10",
    icon: "➕",
    topics: [
      { id: "g1_add_5", label: "Cộng trong phạm vi 5", description: "Phép cộng không nhớ", skillGroup: "foundation" },
      { id: "g1_add_10", label: "Cộng trong phạm vi 10", description: "Phép cộng không nhớ", skillGroup: "foundation" },
      { id: "g1_add_split", label: "Tách – gộp số", description: "Tách và gộp nhóm đồ vật", skillGroup: "foundation" },
      { id: "g1_add_missing", label: "Điền số (cộng)", description: "Hoàn thành phép cộng", skillGroup: "foundation" },
      { id: "g1_add_word", label: "Bài toán cộng", description: "Thêm đồ vật vào nhóm", skillGroup: "problem" },
    ],
  },
  {
    id: "sub10",
    label: "Phép trừ trong phạm vi 10",
    icon: "➖",
    topics: [
      { id: "g1_sub_5", label: "Trừ trong phạm vi 5", description: "Phép trừ không nhớ", skillGroup: "foundation" },
      { id: "g1_sub_10", label: "Trừ trong phạm vi 10", description: "Phép trừ không nhớ", skillGroup: "foundation" },
      { id: "g1_sub_takeaway", label: "Bớt đi", description: "Bớt đồ vật, tìm còn lại", skillGroup: "foundation" },
      { id: "g1_sub_missing", label: "Điền số (trừ)", description: "Tìm số bị trừ, số trừ", skillGroup: "foundation" },
      { id: "g1_sub_word", label: "Bài toán trừ", description: "Bớt một nhóm đồ vật", skillGroup: "problem" },
    ],
  },
  {
    id: "hundred",
    label: "Các số đến 100",
    icon: "💯",
    topics: [
      { id: "g1_hundred_read", label: "Đọc và viết số", description: "Số từ 0 đến 100", skillGroup: "core" },
      { id: "g1_hundred_structure", label: "Cấu tạo số", description: "Chục và đơn vị", skillGroup: "core" },
      { id: "g1_hundred_compare", label: "So sánh số đến 100", description: "So sánh và sắp xếp", skillGroup: "core" },
      { id: "g1_hundred_neighbor", label: "Số liền trước – sau", description: "Tìm số kế cận", skillGroup: "core" },
    ],
  },
  {
    id: "calc100",
    label: "Cộng trừ trong phạm vi 100",
    icon: "🧮",
    topics: [
      { id: "g1_calc_add_100", label: "Cộng không nhớ", description: "Cộng số có hai chữ số", skillGroup: "core" },
      { id: "g1_calc_sub_100", label: "Trừ không nhớ", description: "Trừ số có hai chữ số", skillGroup: "core" },
      { id: "g1_calc_mental", label: "Tính nhẩm", description: "Tính nhanh theo nhóm", skillGroup: "advanced" },
      { id: "g1_calc_sign", label: "Điền dấu", description: ">, <, = với phép tính", skillGroup: "core" },
    ],
  },
  {
    id: "geometry",
    label: "Hình học cơ bản",
    icon: "🔺",
    topics: [
      { id: "g1_geo_recognize", label: "Nhận biết hình", description: "Vuông, chữ nhật, tam giác, tròn", skillGroup: "core" },
      { id: "g1_geo_puzzle", label: "Ghép hình", description: "Ghép hình đơn giản", skillGroup: "core" },
      { id: "g1_geo_count", label: "Đếm hình", description: "Đếm hình giống nhau", skillGroup: "core" },
      { id: "g1_geo_spatial", label: "Quan sát không gian", description: "Trái–phải, trên–dưới", skillGroup: "core" },
    ],
  },
  {
    id: "measure",
    label: "Đo lường cơ bản",
    icon: "📏",
    topics: [
      { id: "g1_measure_length", label: "Độ dài", description: "Dài hơn, ngắn hơn", skillGroup: "core" },
      { id: "g1_measure_time_period", label: "Buổi trong ngày", description: "Sáng, trưa, chiều, tối", skillGroup: "core" },
      { id: "g1_measure_clock", label: "Đồng hồ", description: "Xem giờ đúng", skillGroup: "core" },
      { id: "g1_measure_money", label: "Tiền Việt Nam", description: "Nhận biết và đếm tiền", skillGroup: "core" },
    ],
  },
  {
    id: "word",
    label: "Giải toán có lời văn",
    icon: "📝",
    topics: [
      { id: "g1_word_add", label: "Dạng thêm vào", description: "Có thêm đồ vật", skillGroup: "problem" },
      { id: "g1_word_sub", label: "Dạng bớt đi", description: "Mất đi đồ vật", skillGroup: "problem" },
      { id: "g1_word_compare", label: "Dạng so sánh", description: "Nhiều hơn, ít hơn", skillGroup: "problem" },
      { id: "g1_word_total", label: "Dạng tìm tổng", description: "Gộp hai nhóm", skillGroup: "problem" },
    ],
  },
  {
    id: "logic",
    label: "Tư duy logic",
    icon: "🧩",
    topics: [
      { id: "g1_logic_pattern", label: "Tìm quy luật", description: "Dãy số và hình đơn giản", skillGroup: "problem" },
      { id: "g1_logic_shape", label: "Điền hình còn thiếu", description: "Hoàn thành mẫu hình", skillGroup: "problem" },
      { id: "g1_logic_classify", label: "Phân loại", description: "Nhóm theo màu, hình, kích thước", skillGroup: "problem" },
      { id: "g1_logic_path", label: "Tìm đường đi", description: "Chọn đường đúng", skillGroup: "problem" },
    ],
  },
  {
    id: "advanced",
    label: "Toán tư duy nâng cao",
    icon: "🌟",
    topics: [
      { id: "g1_adv_split", label: "Tách và ghép số", description: "Tách số nhiều cách", skillGroup: "advanced" },
      { id: "g1_adv_compare", label: "So sánh nhanh", description: "Tìm lớn nhất, bé nhất", skillGroup: "advanced" },
      { id: "g1_adv_count", label: "Đếm nâng cao", description: "Đếm bước 2, bước 5", skillGroup: "advanced" },
      { id: "g1_adv_real", label: "Bài toán thực tế", description: "Mua bán, chia đồ vật", skillGroup: "advanced" },
    ],
  },
];

export const ALL_GRADE1_TOPIC_IDS: Grade1TopicId[] = GRADE1_CURRICULUM.flatMap((c) =>
  c.topics.map((t) => t.id)
);

export function getGrade1Topic(id: Grade1TopicId): Grade1Topic | undefined {
  for (const chapter of GRADE1_CURRICULUM) {
    const topic = chapter.topics.find((t) => t.id === id);
    if (topic) return topic;
  }
  return undefined;
}

export function getGrade1ChapterForTopic(id: Grade1TopicId): Grade1Chapter | undefined {
  return GRADE1_CURRICULUM.find((c) => c.topics.some((t) => t.id === id));
}

export function getGrade1TopicLabel(id: Grade1TopicId): string {
  return getGrade1Topic(id)?.label ?? id;
}

export function getGrade1TopicIcon(id: Grade1TopicId): string {
  return getGrade1ChapterForTopic(id)?.icon ?? "🔢";
}
