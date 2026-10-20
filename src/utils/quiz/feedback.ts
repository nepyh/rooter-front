/**
 * 10분 단위로 내린 지금 시각에서 minutesAgo 분 전
 * @param minutesAgo 몇 분 전인지
 */
export const roundedNow = (minutesAgo = 0) => {
  const date = new Date(Date.now() - minutesAgo * 60000);
  date.setMinutes(Math.floor(date.getMinutes() / 10) * 10, 0, 0);
  return date;
};

/**
 * 두 시각 사이의 분. 종료가 시작보다 이르면 자정을 넘긴 것으로 봄
 * @param start 시작 시각
 * @param end 종료 시각
 */
export const diffMinutes = (start: Date, end: Date) => {
  const diff = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
  return diff < 0 ? diff + 24 * 60 : diff;
};
