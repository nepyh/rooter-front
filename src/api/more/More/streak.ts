import { getStreak } from '../../common/user';

// ================================
// Functions
// ================================

/**
 * 하루 완료율(0~100)을 잔디 색 단계(0~5)로 변환
 * @param rate 완료율
 */
export const completionRateToLevel = (rate: number) => (rate <= 0 ? 0 : Math.min(5, Math.ceil(rate / 20)));

/**
 * 기간 안의 날짜별 잔디 색 단계 조회
 * @param userId 유저 ID
 * @param start 조회 시작일 (yyyy-MM-dd)
 * @param end 조회 종료일 (yyyy-MM-dd)
 * @returns 날짜(yyyy-MM-dd) → 색 단계(0~5), 기록이 없는 날은 빠짐
 */
export const getContributionLevels = async (userId: number, start: string, end: string): Promise<Record<string, number>> => {
  const streak = await getStreak(userId, start, end);
  const levels: Record<string, number> = {};
  streak.days.forEach((day) => { levels[day.date] = completionRateToLevel(day.completionRate); });
  return levels;
};
