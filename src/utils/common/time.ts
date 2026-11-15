// ================================
// Constants
// ================================

export const DAY_MIN = 24 * 60;

// ================================
// Functions
// ================================

export const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 시각을 "HH:MM" 으로 변환
 * @param date 변환할 시각
 */
export const formatClock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * "HH:MM" 을 00:00 기준 분으로 변환
 * @param value "HH:MM" 문자열
 */
export const parseHHmm = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};

/**
 * 계획의 시작 시각(날짜 + 시작 시간, 기기 시간 기준)이 지났는지. 완료(퀴즈)·실패는 시작한 계획만 할 수 있음
 * 서버(TASK_NOT_STARTED)와 같은 기준이라, 오늘 계획도 시작 시간 전이면 false
 * @param dateKey 계획 날짜 (yyyy-MM-dd)
 * @param startTime 시작 시각 ("HH:MM")
 * @param now 현재 시각
 */
export const hasTaskStarted = (dateKey: string, startTime: string, now: Date) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 0, parseHHmm(startTime)).getTime() <= now.getTime();
};

/**
 * 사용자가 입력한 "H:MM" / "HH:MM" 을 서버 형식 "HH:MM" 으로 정리
 * @param value 입력값
 * @returns "HH:MM", 형식이 틀리면 null
 */
export const normalizeClock = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59) return null;
  return `${pad(h)}:${pad(m)}`;
};
