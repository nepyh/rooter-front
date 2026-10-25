import type { PlanTask } from "@/api/common/planBoard";
import { toLocalDateString } from "@/utils/common/date";

/**
 * yyyy-MM-dd 를 그날 0시(기기 시간)로 변환
 * @param value 날짜 문자열
 */
export const parseDateString = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 그 날짜가 속한 주(월~일)의 월요일
 * @param value 날짜 문자열 (yyyy-MM-dd)
 * @returns 월요일 (yyyy-MM-dd)
 */
export const getWeekStartKey = (value: string) => {
  const date = parseDateString(value);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toLocalDateString(date);
};

/**
 * 가운데 날짜 앞뒤 3일씩, 7일 날짜 목록
 * @param center 가운데에 둘 날짜
 */
export const getWeekDates = (center: Date) => {
  const start = new Date(center.getFullYear(), center.getMonth(), center.getDate() - 3);
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
};

/**
 * 할 일의 끝나는 시각이 지났는지 (지난 할 일은 실패로 봄)
 * @param task 할 일
 * @param dateKey 할 일 날짜 (yyyy-MM-dd)
 */
export const isTaskEnded = (task: PlanTask, dateKey: string) => {
  const endTime = task.endTime === "24:00" ? "23:59" : task.endTime;
  return new Date(`${dateKey}T${endTime}:00`).getTime() <= Date.now();
};
