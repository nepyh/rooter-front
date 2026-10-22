import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

export type Category = "math" | "english" | "science" | "social" | "neutral";

// ================================
// Constants
// ================================

/**
 * 과목별 블록 색
 * @param bar 왼쪽 세로 막대
 * @param bg 기본 배경
 * @param focus 꾹 눌러 옮길 준비가 된 상태의 배경
 * @param muted 꾹 눌러 옮길 준비가 된 상태의 위아래 손잡이
 */
export const CATEGORY_COLORS: Record<Category, { bar: string; bg: string; focus: string; muted: string }> = {
  math: {
    bar: color.label["red-primary"],
    bg: color.label["red-overlay"],
    focus: color.label["red-focus"],
    muted: color.label["red-muted"],
  },
  english: {
    bar: color.label["deepblue-primary"],
    bg: color.label["deepblue-overlay"],
    focus: color.label["deepblue-focus"],
    muted: color.label["deepblue-muted"],
  },
  science: {
    bar: color.label["yellow-primary"],
    bg: color.label["yellow-overlay"],
    focus: color.label["yellow-focus"],
    muted: color.label["yellow-muted"],
  },
  social: {
    bar: color.label["lightblue-primary"],
    bg: color.label["lightblue-overlay"],
    focus: color.label["lightblue-focus"],
    muted: color.label["lightblue-muted"],
  },
  neutral: {
    bar: color.label["grey-primary"],
    bg: color.label["grey-overlay"],
    focus: color.label["grey-focus"],
    muted: color.label["grey-muted"],
  },
};

export const SUBJECT_CATEGORIES: Record<string, Category> = {
  "수학": "math",
  "영어": "english",
  "과학": "science",
  "사회": "social",
};
