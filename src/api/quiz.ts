import api from './axios';

// ================================
// Types
// ================================

export interface QuizChoice {
  id: number;
  choiceText: string;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  choices: QuizChoice[];
}

export interface Quiz {
  dailyPlanId: number;
  quizDate: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  selectedChoiceId: number;
}

export interface WeakArea {
  chapterName: string;
  reviewTaskDescription: string;
}

export interface InsertedReviewTask {
  dailyPlanId: number;
  planDate: string;
  taskName: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  weakAreas: WeakArea[];
  insertedReviewTasks: InsertedReviewTask[];
}

/**
 * 일일 퀴즈 생성 API 함수
 * @param date 대상 날짜 (yyyy-MM-dd), 생략 시 오늘
 * @returns 생성된 퀴즈 문제
 */
export const generateQuiz = async (date?: string): Promise<Quiz> => {
  const response = await api.post('/quiz/generate', { date: date ?? null });
  return response.data;
};

/**
 * 퀴즈 문제 조회 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @returns 퀴즈 문제 (정답 미포함)
 */
export const getQuiz = async (dailyPlanId: number): Promise<Quiz> => {
  const response = await api.get(`/quiz/${dailyPlanId}`);
  return response.data;
};

/**
 * 퀴즈 제출 및 채점 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @param answers 문항별 선택한 답안
 * @returns 채점 결과
 */
export const submitQuiz = async (dailyPlanId: number, answers: QuizAnswer[]): Promise<QuizResult> => {
  const response = await api.post(`/quiz/${dailyPlanId}/submit`, { answers });
  return response.data;
};
