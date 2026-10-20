import { getCalendarRange } from './calendar';
import type { CalendarRange } from './calendar';
import type { Category } from '@/constants/category';

// ================================
// Types
// ================================

/**
 * 캘린더 칸에 그리는 일정 하나
 * @param id 개인 일정 id (수정·삭제 가능), 시험은 없음
 * @param kind 시험(exam) / 개인 일정(event)
 */
export interface CalendarItem {
  id?: number;
  kind: "exam" | "event";
  label: string;
  memo: string;
  category: Category;
}

export type CalendarItemsByDate = Record<string, CalendarItem[]>;

// ================================
// Functions
// ================================

/**
 * 시험·개인 일정을 날짜별 캘린더 일정으로 묶음
 * @param range 기간별 캘린더 조회 결과
 */
export const buildItemsByDate = (range: CalendarRange): CalendarItemsByDate => {
  const map: CalendarItemsByDate = {};
  range.exams.forEach((exam) => {
    (map[exam.examDate] ??= []).push({ kind: "exam", label: exam.title, memo: `시험일 D-${exam.dDay}`, category: "neutral" });
  });
  range.events.forEach((event) => {
    (map[event.eventDate] ??= []).push({ id: event.id, kind: "event", label: event.title, memo: event.memo ?? "", category: "social" });
  });
  return map;
};

/**
 * 기간 안의 시험·개인 일정을 날짜별로 조회
 * @param start 조회 시작일 (yyyy-MM-dd)
 * @param end 조회 종료일 (yyyy-MM-dd)
 * @returns 날짜(yyyy-MM-dd) → 그날 일정 목록
 */
export const getCalendarItemsByDate = async (start: string, end: string): Promise<CalendarItemsByDate> =>
  buildItemsByDate(await getCalendarRange(start, end));
