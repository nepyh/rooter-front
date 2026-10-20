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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
