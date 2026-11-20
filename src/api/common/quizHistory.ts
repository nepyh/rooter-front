import api from '../axios';

// ================================
// Types
// ================================

export type QuizHistoryStatus = "todo" | "missed" | "done";

/**
 * 퀴즈 기록 하나 (퀴즈 1차수)
 * @param status TODO(오늘 풀 퀴즈) / MISSED(날짜가 지나도록 안 푼 퀴즈) / DONE(응시 완료)
 * @param createdAt 퀴즈가 만들어진 시각 (오프셋 포함 ISO)
 * @param passed 통과 여부, 아직 안 풀었으면 null
 */
export interface QuizHistoryItem {
  quizId: number;
  type: string;
  status: "TODO" | "MISSED" | "DONE";
  planTaskId: number;
  attemptNumber: number;
  title: string;
  subjectId: number | null;
  subjectName: string | null;
  createdAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  correctCount: number | null;
  totalCount: number;
  passed: boolean | null;
}

export interface QuizHistoryList {
  quizzes: QuizHistoryItem[];
  totalCount: number;
  nextCursor: number | null;
}

/**
 * 퀴즈 기록 조회 조건
 * @param status todo / missed / done, 생략하면 전체
 * @param cursor 앞 페이지 응답의 nextCursor, 생략하면 첫 페이지
 * @param limit 한 번에 받을 개수 (1~50, 생략하면 50)
 */
export interface QuizHistoryQuery {
  status?: QuizHistoryStatus;
  cursor?: number;
  limit?: number;
}

// ================================
// Functions
// ================================

/**
 * 퀴즈 기록 목록 조회 API 함수 (차수 단위, 최신순)
 * @param query 상태·페이지 조건
 * @returns 퀴즈 기록 목록과 다음 페이지 cursor
 */
export const getQuizHistory = async (query: QuizHistoryQuery = {}): Promise<QuizHistoryList> => {
  const response = await api.get('/quiz-history', { params: query });
  return response.data;
};
