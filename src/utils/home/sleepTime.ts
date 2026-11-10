import type { SleepTimeInput } from "@/api/common/user";
import { DAY_MIN, pad, parseHHmm } from "@/utils/common/time";

/**
 * 기상 시각과 목표 수면 시간으로 서버에 보낼 취침·기상 시각을 만듦. 자정 전에 자면 전날 시각
 * @param wakeTime 기상 시각 "HH:MM"
 * @param sleepHours 목표 수면 시간 (시간)
 */
export const toSleepTimeInput = (
  wakeTime: string,
  sleepHours: number,
): SleepTimeInput => {
  const sleepMin = (parseHHmm(wakeTime) - sleepHours * 60 + DAY_MIN) % DAY_MIN;
  return {
    sleepTime: `${pad(Math.floor(sleepMin / 60))}:${pad(sleepMin % 60)}`,
    wakeTime,
  };
};

/**
 * 서버의 취침·기상 시각을 수면 시간 화면 값으로 바꿈
 * @param sleepTime 취침·기상 시각 "HH:MM"
 * @returns wakeMin(기상 분), sleepHours(수면 시간, 정시 단위가 아니면 소수)
 */
export const fromSleepTime = ({ sleepTime, wakeTime }: SleepTimeInput) => {
  const wakeMin = parseHHmm(wakeTime);
  return {
    wakeMin,
    sleepHours: ((wakeMin - parseHHmm(sleepTime) + DAY_MIN) % DAY_MIN) / 60,
  };
};
