import type { QuizHistoryItem } from "@/api/common/quizHistory";
import { QUIZ_MAX_ATTEMPTS, QUIZ_RETRY_DELAY_MS } from "@/constants/quiz";
import { parseServerDateTime } from "@/utils/common/date";

// ================================
// Functions
// ================================

/**
 * 할일의 퀴즈에 떨어져 재도전을 기다리는 중이면, 다시 풀 수 있는 시각을 돌려줌
 * 서버는 떨어진 차수가 만들어진 지 10분이 지나야 다음 차수를 만들고, 3차까지 떨어지면 재도전이 없음
 * @param history 응시 완료한 퀴즈 기록 (최신순)
 * @param taskId 할일 ID
 * @param now 현재 시각
 * @returns 다시 풀 수 있는 시각, 기다릴 필요가 없으면 null
 */
export const getQuizRetryAt = (history: QuizHistoryItem[], taskId: number, now: Date) => {
  const latest = history.find((item) => item.planTaskId === taskId);
  if (!latest || latest.passed !== false || latest.attemptNumber >= QUIZ_MAX_ATTEMPTS) return null;
  const retryAt = new Date(parseServerDateTime(latest.createdAt).getTime() + QUIZ_RETRY_DELAY_MS);
  return retryAt.getTime() > now.getTime() ? retryAt : null;
};
