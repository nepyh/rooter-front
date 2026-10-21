import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import type { DailyBusyTime } from "@/api/home/Home/busyTime";
import type { PlanTask } from "@/api/common/planBoard";
import { DAY_MIN, pad, parseHHmm } from "@/utils/common/time";

// ================================
// Types
// ================================

export type PlanStatus = "pending" | "done" | "failed";

export interface PlanLine {
  icon: "book" | "history";
  text: string;
}

/**
 * 타임라인에 그리는 계획 블록
 * @param start 타임라인 시작(00:00) 기준 오프셋(분)
 * @param duration 길이(분)
 */
export interface Plan {
  id: string;
  title: string;
  category: Category;
  lines: PlanLine[];
  start: number;
  duration: number;
  status: PlanStatus;
  dailyPlanId?: number;
}

/**
 * 수면·학교·불가능 시간 블록
 * @param start 타임라인 시작 기준 오프셋(분)
 * @param duration 길이(분)
 */
export interface BusyBlock {
  key: string;
  title: string;
  start: number;
  duration: number;
  label: string;
}

/**
 * 겹치는 계획을 나란히 놓을 때의 칸 위치
 * @param column 0부터 시작하는 칸 번호
 * @param columns 겹치는 묶음의 전체 칸 수
 */
export interface PlanColumn {
  column: number;
  columns: number;
}

// ================================
// Constants
// ================================

export const WINDOW_START_MIN = 0;
export const TIMELINE_HEIGHT = DAY_MIN;
export const TIMELINE_LEFT = 52;
export const POPOVER_HEIGHT = 92;

export const HOURS = Array.from({ length: 24 }, (_, i) => (WINDOW_START_MIN / 60 + i) % 24);

const BUSY_TITLES: Record<"SLEEP" | "SCHOOL" | "UNAVAILABLE", string> = {
  "SLEEP": "수면",
  "SCHOOL": "학교",
  "UNAVAILABLE": "불가능 시간",
};

// ================================
// Functions
// ================================

export const minutesSinceWindowStart = (date: Date) =>
  (date.getHours() * 60 + date.getMinutes() - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;

export const formatDateHeader = (date: Date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

export const formatDuration = (mins: number) => {
  if (mins % 60 === 0) return `${mins / 60}시간`;
  if (mins < 60) return `${mins}분`;
  return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
};

/**
 * 하루 기준 분을 "HH:MM" 으로 변환
 * @param minutes 00:00 기준 분
 */
export const toClockString = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/**
 * 사용자가 입력한 "H:MM" / "HH:MM" 을 분으로 변환
 * @param value 입력값
 * @returns 00:00 기준 분, 형식이 틀리면 null
 */
export const parseClock = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59) return null;
  return h * 60 + m;
};

/**
 * 오늘부터 시험일까지 남은 일수
 * @param examDate 시험일 (YYYY-MM-DD)
 * @param now 현재 시각
 * @returns 남은 일수, 시험 당일은 0
 */
export const getDDay = (examDate: string, now: Date) => {
  const [y, m, d] = examDate.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
};

/**
 * 바쁜 시간 하나를 블록으로 변환. 자정을 넘으면 두 조각으로 나누고, 두 조각 모두 전체 시간을 표시
 */
const toBusyBlocks = (key: string, title: string, startTime: string, endTime: string): BusyBlock[] => {
  const from = (parseHHmm(startTime) - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
  const rawEnd = endTime === "24:00" ? DAY_MIN : parseHHmm(endTime);
  let to = (rawEnd - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
  if (to <= from) to += DAY_MIN;
  const label = `${startTime} - ${endTime} | ${formatDuration(to - from)}`;
  const pieces: [number, number][] = to > DAY_MIN ? [[from, DAY_MIN], [0, to - DAY_MIN]] : [[from, to]];
  return pieces.map(([start, end], i) => ({ key: `${key}-${i}`, title, start, duration: end - start, label }));
};

/**
 * 서버 바쁜 시간을 타임라인 블록으로 변환
 * - 할일(TASK)은 계획 블록으로 따로 그려서 제외
 * - 밤(23:00~24:00)과 아침(00:00~06:30)으로 나뉜 수면을 한 번의 잠으로 합침
 * - 학교는 서버가 00:00~하교로 주므로 아침 수면이 끝난 뒤부터 그림
 * @param day 그날의 바쁜 시간
 */
export const buildBusyBlocks = (day: DailyBusyTime | null): BusyBlock[] => {
  if (!day) return [];
  const morningSleep = day.busyTimes.find((item) => item.type === "SLEEP" && item.startTime === "00:00");
  const nightSleep = day.busyTimes.find((item) => item.type === "SLEEP" && item.endTime === "24:00");
  const morningSleepEnd = morningSleep?.endTime;
  const mergedSleep = morningSleep && nightSleep
    ? toBusyBlocks("sleep", BUSY_TITLES.SLEEP, nightSleep.startTime, morningSleep.endTime)
    : [];
  return mergedSleep.concat(day.busyTimes.flatMap((item, i) => {
    if (item.type === "TASK") return [];
    if (mergedSleep.length > 0 && (item === morningSleep || item === nightSleep)) return [];
    if (item.type === "SCHOOL") {
      const start = morningSleepEnd && morningSleepEnd > item.startTime ? morningSleepEnd : item.startTime;
      return toBusyBlocks(`school-${i}`, BUSY_TITLES.SCHOOL, start, item.endTime);
    }
    return toBusyBlocks(`${item.type.toLowerCase()}-${i}`, BUSY_TITLES[item.type], item.startTime, item.endTime);
  }));
};

/**
 * 시간이 겹치는 블록끼리 묶어 빈 칸에 차례로 배치. 안 겹치면 한 칸(전체 너비)
 * 계획과 바쁜 시간이 겹쳐도 서로 가리지 않도록 함께 넘김
 * @param items 배치할 블록 목록 (id 는 서로 겹치지 않아야 함)
 * @returns 블록 id → 칸 위치
 */
export const layoutColumns = (items: { id: string; start: number; duration: number }[]): Map<string, PlanColumn> => {
  const result = new Map<string, PlanColumn>();
  const sorted = [...items].sort((a, b) => a.start - b.start || b.duration - a.duration);
  let group: { id: string; column: number }[] = [];
  let columnEnds: number[] = [];
  let groupEnd = -1;

  const flush = () => {
    group.forEach(({ id, column }) => result.set(id, { column, columns: columnEnds.length }));
    group = [];
    columnEnds = [];
  };

  sorted.forEach((item) => {
    if (item.start >= groupEnd) flush();
    const end = item.start + item.duration;
    let column = columnEnds.findIndex((columnEnd) => columnEnd <= item.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = end;
    group.push({ id: item.id, column });
    groupEnd = Math.max(groupEnd, end);
  });
  flush();
  return result;
};

export const mapPlanTaskToPlan = (task: PlanTask): Plan => {
  const startMin = parseHHmm(task.startTime);
  const start = (startMin - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;

  return {
    id: String(task.id),
    title: task.taskName,
    category: "neutral",
    start,
    duration: task.estimatedMinutes,
    status: task.isCompleted ? "done" : "pending",
    dailyPlanId: task.dailyPlanId,
    lines: [
      { icon: "history", text: `${task.startTime} - ${task.endTime} | ${formatDuration(task.estimatedMinutes)}` },
    ],
  };
};
