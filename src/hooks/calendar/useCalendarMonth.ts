import { useRef, useState } from "react";
import { buildMonthWeeks, toLocalDateString } from "@/utils/date";

// ================================
// Types
// ================================

export type SlideDirection = "next" | "prev";

// ================================
// Hooks
// ================================

/**
 * useCalendarMonth — 캘린더에서 보고 있는 달과 이전·다음 달 이동 관리
 * @param now 현재 시각, 처음 보여줄 달과 머리글의 오늘 날짜에 씀
 * @returns viewDate, weeks, gridStartKey, gridEndKey, headerText, direction, hasNavigated, goPrevMonth, goNextMonth
 */
export function useCalendarMonth(now: Date) {
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [direction, setDirection] = useState<SlideDirection>("next");
  const hasNavigatedRef = useRef(false);

  const weeks = buildMonthWeeks(viewDate.getFullYear(), viewDate.getMonth());
  const gridStartKey = toLocalDateString(weeks[0][0].date);
  const gridEndKey = toLocalDateString(weeks[weeks.length - 1][6].date);

  const isViewingCurrentMonth = viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth();
  const headerText = isViewingCurrentMonth
    ? `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월 ${now.getDate()}일`
    : `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  const moveMonth = (delta: number) => {
    hasNavigatedRef.current = true;
    setDirection(delta > 0 ? "next" : "prev");
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return {
    viewDate,
    weeks,
    gridStartKey,
    gridEndKey,
    headerText,
    direction,
    hasNavigated: hasNavigatedRef.current,
    goPrevMonth: () => moveMonth(-1),
    goNextMonth: () => moveMonth(1),
  };
}
