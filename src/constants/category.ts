import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

export type Category = "math" | "english" | "science" | "social" | "neutral";

// ================================
// Constants
// ================================

export const CATEGORY_COLORS: Record<Category, { bar: string; bg: string }> = {
  math: { bar: color.label["red-primary"], bg: color.label["red-overlay"] },
  english: { bar: color.label["deepblue-primary"], bg: color.label["deepblue-overlay"] },
  science: { bar: color.label["yellow-primary"], bg: color.label["yellow-overlay"] },
  social: { bar: color.label["lightblue-primary"], bg: color.label["lightblue-overlay"] },
  neutral: { bar: color.label["grey-primary"], bg: color.label["grey-overlay"] },
};

export const SUBJECT_CATEGORIES: Record<string, Category> = {
  "수학": "math",
  "영어": "english",
  "과학": "science",
  "사회": "social",
};
