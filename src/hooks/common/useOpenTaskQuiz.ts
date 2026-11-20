import { useCallback, useRef } from "react";
import { router } from "expo-router";
import { getQuizHistory } from "@/api/common/quizHistory";
import type { Category } from "@/constants/category";
import { getQuizRetryAt } from "@/utils/common/quizRetry";

// ================================
// Types
// ================================

/**
 * 퀴즈 화면에 넘기는 값
 * @param taskId 할일 ID
 * @param dailyPlanId 퀴즈 뒤 피드백 화면에 넘길 일일 계획 ID (없으면 빈 문자열)
 * @param category 퀴즈 응답에 과목이 없을 때 과목 이름을 고르는 카테고리
 * @param date 할일 날짜 (yyyy-MM-dd)
 * @param startTime 할일 시작 시각 ("HH:MM")
 */
export interface TaskQuizParams {
  taskId: string;
  dailyPlanId: string;
  category?: Category;
  date: string;
  startTime: string;
}

// ================================
// Constants
// ================================

/**
 * 재도전 대기 여부를 볼 때 불러올 최근 퀴즈 기록 수
 * 기다리는 퀴즈는 10분 안에 만들어진 것이라 최신순 목록 앞쪽에 있음
 */
const RETRY_LOOKUP_LIMIT = 10;

// ================================
// Functions
// ================================

/**
 * 할일의 퀴즈를 다시 풀 수 있는 시각을 조회. 기록을 불러오지 못하면 기다리지 않는 것으로 보고 null
 * @param taskId 할일 ID
 */
const fetchQuizRetryAt = (taskId: number) =>
  getQuizHistory({ status: "done", limit: RETRY_LOOKUP_LIMIT })
    .then(({ quizzes }) => getQuizRetryAt(quizzes, taskId, new Date()))
    .catch(() => null);

// ================================
// Hooks
// ================================

/**
 * useOpenTaskQuiz — 할일의 퀴즈 화면을 여는 함수를 돌려줌
 * 퀴즈에 떨어져 재도전 대기 시간이 남았으면 퀴즈 화면 대신 재도전 대기 화면을 엶 (대기 중엔 서버가 이미 채점한 퀴즈를 돌려줘 풀 수 없음)
 * 확인하는 동안 다시 눌러도 화면이 두 번 열리지 않음
 */
export function useOpenTaskQuiz() {
  const openingRef = useRef(false);

  return useCallback(async (params: TaskQuizParams) => {
    if (openingRef.current) return;
    openingRef.current = true;
    try {
      const retryAt = await fetchQuizRetryAt(Number(params.taskId));
      if (retryAt) router.push({ pathname: "/Quiz/QuizRetryWaitPage", params: { ...params, retryAt: retryAt.toISOString() } });
      else router.push({ pathname: "/Quiz/QuizPage", params: { ...params } });
    } finally {
      openingRef.current = false;
    }
  }, []);
}
