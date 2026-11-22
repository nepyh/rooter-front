import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_NAMES, type UnavailableKind, type UnavailableTime } from "@/api/common/user";
import { toClockString, type BusyDrop } from "@/utils/home/timeline";

// ================================
// Types
// ================================

type MealKind = Extract<UnavailableKind, "BREAKFAST" | "LUNCH" | "DINNER">;

// ================================
// Constants
// ================================

const MEAL_KINDS: MealKind[] = ["BREAKFAST", "LUNCH", "DINNER"];

const MEAL_TITLE_WORDS: Record<MealKind, string> = {
  "BREAKFAST": "아침",
  "LUNCH": "점심",
  "DINNER": "저녁",
};

// 이름으로 못 가르면 시작 시각으로 가름 (10시 전 아침, 15시 전 점심, 그 뒤 저녁)
const BREAKFAST_BEFORE_MIN = 10 * 60;
const LUNCH_BEFORE_MIN = 15 * 60;

// ================================
// Functions
// ================================

/**
 * 서버 요일 번호 (월요일 1 ~ 일요일 7)
 * @param date 날짜
 */
export const toDayOfWeekNumber = (date: Date) => ((date.getDay() + 6) % 7) + 1;

/**
 * 끌어 놓은 블록의 새 시작·종료 시각 ("HH:MM")
 * @param drop 끌어 놓은 블록과 새 위치
 */
export const getDropClock = (drop: BusyDrop) => ({
  start: toClockString(drop.start),
  end: toClockString(drop.start + drop.duration),
});

/**
 * 끌어 놓은 식사 블록이 그 요일의 어느 식사인지와, 이미 저장된 식사 시간
 * 저장된 식사 중 시간이 똑같은 것 → 블록 이름(아침·점심·저녁) → 시작 시각 순으로 가름
 * @param drop 끌어 놓은 식사 블록
 * @param items 내 불가능 시간 목록
 * @param dayOfWeek 블록이 있는 요일 (월요일 1 ~ 일요일 7)
 * @returns kind(식사 종류), existing(같은 요일·종류로 이미 저장된 식사, 없으면 null)
 */
export const resolveMeal = (drop: BusyDrop, items: UnavailableTime[], dayOfWeek: number) => {
  const dayName = DAY_OF_WEEK_NAMES[dayOfWeek - 1];
  const meals = items.filter((item) => item.dayOfWeek === dayName && (MEAL_KINDS as UnavailableKind[]).includes(item.kind));
  const start = toClockString(drop.block.start);
  const end = toClockString(drop.block.start + drop.block.duration);

  const sameTime = meals.find((item) => item.startTime.slice(0, 5) === start && item.endTime.slice(0, 5) === end);
  const byTitle = MEAL_KINDS.find((kind) => drop.block.title.includes(MEAL_TITLE_WORDS[kind]));
  const byStart: MealKind = drop.block.start < BREAKFAST_BEFORE_MIN ? "BREAKFAST" : drop.block.start < LUNCH_BEFORE_MIN ? "LUNCH" : "DINNER";
  const kind = sameTime?.kind ?? byTitle ?? byStart;

  return { kind, existing: sameTime ?? meals.find((item) => item.kind === kind) ?? null };
};

/**
 * 끌어 놓은 바쁜 시간을 바꿀지 묻는 확인창 문구
 * @param drop 끌어 놓은 블록과 새 위치
 * @param date 블록이 있는 날짜
 * @returns title, description
 */
export const describeBusyDrop = (drop: BusyDrop, date: Date) => {
  const { start, end } = getDropClock(drop);
  if (drop.block.edit?.target === "sleep") {
    const isBedTime = drop.block.edit.edge === "top";
    return {
      title: isBedTime ? "취침 시간을 바꿀까요?" : "기상 시간을 바꿀까요?",
      description: `${isBedTime ? `${start} 취침` : `${end} 기상`}\n매일 반영되고, 이미 만든 계획은 그대로예요.`,
    };
  }
  const dayLabel = DAY_OF_WEEK_LABELS[toDayOfWeekNumber(date) - 1];
  return {
    title: `${dayLabel}요일 ${drop.block.title} 시간을 바꿀까요?`,
    description: `${start} - ${end}\n매주 ${dayLabel}요일에 반영되고, 이미 만든 계획은 그대로예요.`,
  };
};
