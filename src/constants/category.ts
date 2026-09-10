// ================================
// Types
// ================================

export type Category = "math" | "english" | "science" | "social" | "neutral";

// ================================
// Constants
// ================================

export const CATEGORY_COLORS: Record<Category, { bar: string; bg: string }> = {
  math: { bar: "#ff5252", bg: "rgba(255,82,82,0.15)" },
  english: { bar: "#5283ff", bg: "rgba(82,131,255,0.15)" },
  science: { bar: "#ffe252", bg: "rgba(255,226,82,0.15)" },
  social: { bar: "#add3ff", bg: "rgba(173,211,255,0.15)" },
  neutral: { bar: "#6c6c6c", bg: "rgba(108,108,108,0.15)" },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  math: "수학",
  english: "영어",
  science: "과학",
  social: "사회",
  neutral: "기타",
};
