export type Grade5TopicId =
  | "g5_natural_read"
  | "g5_natural_compare"
  | "g5_natural_arithmetic"
  | "g5_natural_expression"
  | "g5_natural_unknown"
  | "g5_natural_divisibility"
  | "g5_fraction_concept"
  | "g5_fraction_equal"
  | "g5_fraction_simplify"
  | "g5_fraction_compare"
  | "g5_fraction_ops"
  | "g5_fraction_mixed"
  | "g5_decimal_read"
  | "g5_decimal_compare"
  | "g5_decimal_ops"
  | "g5_decimal_convert"
  | "g5_decimal_round"
  | "g5_measure_length"
  | "g5_measure_mass"
  | "g5_measure_area_unit"
  | "g5_measure_volume_unit"
  | "g5_measure_time"
  | "g5_ratio"
  | "g5_percent_concept"
  | "g5_percent_problem"
  | "g5_geo_rect"
  | "g5_geo_square"
  | "g5_geo_triangle"
  | "g5_geo_trapezoid"
  | "g5_geo_circle"
  | "g5_geo_box"
  | "g5_geo_cube"
  | "g5_motion_speed"
  | "g5_motion_distance"
  | "g5_motion_time"
  | "g5_motion_problem"
  | "g5_word_sum_diff"
  | "g5_word_sum_ratio"
  | "g5_word_diff_ratio"
  | "g5_word_productivity"
  | "g5_word_proportion"
  | "g5_word_age"
  | "g5_thinking_sequence"
  | "g5_thinking_logic"
  | "g5_thinking_count"
  | "g5_thinking_multi"
  | "g5_thinking_trial"
  | "g5_thinking_olympiad";

export interface Grade5Topic {
  id: Grade5TopicId;
  label: string;
  description: string;
}

export interface Grade5Chapter {
  id: string;
  label: string;
  icon: string;
  topics: Grade5Topic[];
}

export const GRADE5_CURRICULUM: Grade5Chapter[] = [
  {
    id: "natural",
    label: "Số tự nhiên",
    icon: "🔢",
    topics: [
      { id: "g5_natural_read", label: "Đọc và viết số", description: "Giá trị chữ số trong số tự nhiên" },
      { id: "g5_natural_compare", label: "So sánh và sắp xếp", description: "Thứ tự tăng/giảm dần" },
      { id: "g5_natural_arithmetic", label: "Các phép tính", description: "Cộng, trừ, nhân, chia, tính nhanh" },
      { id: "g5_natural_expression", label: "Biểu thức", description: "Thứ tự phép tính, dấu ngoặc" },
      { id: "g5_natural_unknown", label: "Tìm thành phần chưa biết", description: "Số hạng, thừa số, số chia..." },
      { id: "g5_natural_divisibility", label: "Dấu hiệu chia hết", description: "Chia hết cho 2, 3, 5, 9" },
    ],
  },
  {
    id: "fraction",
    label: "Phân số",
    icon: "🍕",
    topics: [
      { id: "g5_fraction_concept", label: "Khái niệm phân số", description: "Tử số, mẫu số, so với 1" },
      { id: "g5_fraction_equal", label: "Phân số bằng nhau", description: "Nhận biết và tìm phân số bằng nhau" },
      { id: "g5_fraction_simplify", label: "Rút gọn và quy đồng", description: "Rút gọn, quy đồng mẫu số" },
      { id: "g5_fraction_compare", label: "So sánh phân số", description: "Cùng mẫu và khác mẫu" },
      { id: "g5_fraction_ops", label: "Phép tính phân số", description: "Cộng, trừ, nhân, chia phân số" },
      { id: "g5_fraction_mixed", label: "Hỗn số", description: "Chuyển đổi hỗn số và phân số" },
    ],
  },
  {
    id: "decimal",
    label: "Số thập phân",
    icon: "🔟",
    topics: [
      { id: "g5_decimal_read", label: "Đọc và viết", description: "Hàng phần mười, trăm, nghìn" },
      { id: "g5_decimal_compare", label: "So sánh", description: "Sắp xếp số thập phân" },
      { id: "g5_decimal_ops", label: "Phép tính", description: "Cộng, trừ, nhân, chia số thập phân" },
      { id: "g5_decimal_convert", label: "Chuyển đổi", description: "Phân số ↔ số thập phân" },
      { id: "g5_decimal_round", label: "Làm tròn", description: "Làm tròn đến hàng phần mười/trăm" },
    ],
  },
  {
    id: "measure",
    label: "Đơn vị đo lường",
    icon: "⚖️",
    topics: [
      { id: "g5_measure_length", label: "Độ dài", description: "mm, cm, dm, m, km" },
      { id: "g5_measure_mass", label: "Khối lượng", description: "g, kg, tấn" },
      { id: "g5_measure_area_unit", label: "Diện tích", description: "cm², dm², m², ha, km²" },
      { id: "g5_measure_volume_unit", label: "Thể tích", description: "cm³, dm³, m³" },
      { id: "g5_measure_time", label: "Thời gian", description: "Giây, phút, giờ, ngày, tháng, năm" },
    ],
  },
  {
    id: "ratio_percent",
    label: "Tỉ số và phần trăm",
    icon: "💯",
    topics: [
      { id: "g5_ratio", label: "Tỉ số", description: "Tìm và so sánh tỉ số hai số" },
      { id: "g5_percent_concept", label: "Phần trăm", description: "Khái niệm và viết phần trăm" },
      { id: "g5_percent_problem", label: "Bài toán phần trăm", description: "Tìm %, tăng/giảm %" },
    ],
  },
  {
    id: "geo_flat",
    label: "Hình học phẳng",
    icon: "📐",
    topics: [
      { id: "g5_geo_rect", label: "Hình chữ nhật", description: "Chu vi và diện tích" },
      { id: "g5_geo_square", label: "Hình vuông", description: "Chu vi và diện tích" },
      { id: "g5_geo_triangle", label: "Hình tam giác", description: "Diện tích tam giác" },
      { id: "g5_geo_trapezoid", label: "Hình thang", description: "Diện tích hình thang" },
      { id: "g5_geo_circle", label: "Hình tròn", description: "Bán kính, đường kính, chu vi, diện tích" },
    ],
  },
  {
    id: "geo_solid",
    label: "Hình học không gian",
    icon: "📦",
    topics: [
      { id: "g5_geo_box", label: "Hình hộp chữ nhật", description: "Diện tích và thể tích" },
      { id: "g5_geo_cube", label: "Hình lập phương", description: "Diện tích và thể tích" },
    ],
  },
  {
    id: "motion",
    label: "Toán chuyển động",
    icon: "🏃",
    topics: [
      { id: "g5_motion_speed", label: "Vận tốc", description: "Khái niệm và đổi đơn vị vận tốc" },
      { id: "g5_motion_distance", label: "Quãng đường", description: "s = v × t" },
      { id: "g5_motion_time", label: "Thời gian", description: "t = s ÷ v" },
      { id: "g5_motion_problem", label: "Bài toán chuyển động", description: "Gặp nhau, đuổi kịp, ngược chiều" },
    ],
  },
  {
    id: "word",
    label: "Toán có lời văn",
    icon: "📝",
    topics: [
      { id: "g5_word_sum_diff", label: "Tổng - hiệu", description: "Tìm hai số khi biết tổng và hiệu" },
      { id: "g5_word_sum_ratio", label: "Tổng - tỉ", description: "Tìm hai số khi biết tổng và tỉ" },
      { id: "g5_word_diff_ratio", label: "Hiệu - tỉ", description: "Tìm hai số khi biết hiệu và tỉ" },
      { id: "g5_word_productivity", label: "Năng suất", description: "Công việc chung, hiệu suất" },
      { id: "g5_word_proportion", label: "Tỉ lệ", description: "Tỉ lệ thuận, tỉ lệ nghịch" },
      { id: "g5_word_age", label: "Toán tuổi", description: "Tuổi hiện tại, quá khứ, tương lai" },
    ],
  },
  {
    id: "thinking",
    label: "Toán tư duy và nâng cao",
    icon: "🧠",
    topics: [
      { id: "g5_thinking_sequence", label: "Dãy số", description: "Tìm quy luật, điền số thiếu" },
      { id: "g5_thinking_logic", label: "Suy luận logic", description: "Bài toán điều kiện" },
      { id: "g5_thinking_count", label: "Đếm hình", description: "Đếm tam giác, vuông, chữ nhật" },
      { id: "g5_thinking_multi", label: "Bài toán nhiều bước", description: "Kết hợp nhiều phép tính" },
      { id: "g5_thinking_trial", label: "Thử và chọn", description: "Phương pháp thử, loại trừ" },
      { id: "g5_thinking_olympiad", label: "Olympiad cơ bản", description: "Quy luật số học, mẹo tính" },
    ],
  },
];

export const ALL_GRADE5_TOPIC_IDS: Grade5TopicId[] = GRADE5_CURRICULUM.flatMap((c) =>
  c.topics.map((t) => t.id)
);

export function getGrade5Topic(id: Grade5TopicId): Grade5Topic | undefined {
  for (const chapter of GRADE5_CURRICULUM) {
    const topic = chapter.topics.find((t) => t.id === id);
    if (topic) return topic;
  }
  return undefined;
}

export function getGrade5ChapterForTopic(id: Grade5TopicId): Grade5Chapter | undefined {
  return GRADE5_CURRICULUM.find((c) => c.topics.some((t) => t.id === id));
}

export function getGrade5TopicLabel(id: Grade5TopicId): string {
  return getGrade5Topic(id)?.label ?? id;
}

export function getGrade5TopicIcon(id: Grade5TopicId): string {
  return getGrade5ChapterForTopic(id)?.icon ?? "📐";
}
