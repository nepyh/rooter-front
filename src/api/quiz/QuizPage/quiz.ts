import api, { AI_TIMEOUT_MS } from '../../axios';
import { toLocalDateString } from '@/utils/date';
import type { PlanTask } from '../../planBoard';

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

export interface QuizQuestionResult {
  questionId: number;
  questionText: string;
  selectedChoiceId: number;
  correctChoiceId: number | null;
  correctChoiceText: string | null;
  isCorrect: boolean;
  explanation: string | null;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  weakAreas: WeakArea[];
  insertedReviewTasks: InsertedReviewTask[];
  results: QuizQuestionResult[];
}

/**
 * 일일 퀴즈 생성 API 함수
 * @param date 대상 날짜 (yyyy-MM-dd), 생략 시 오늘
 * @returns 생성된 퀴즈 문제
 */
export const generateQuiz = async (date?: string): Promise<Quiz> => {
  const response = await api.post('/quiz/generate', { date: date ?? toLocalDateString(new Date()) }, { timeout: AI_TIMEOUT_MS });
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
  const response = await api.post(`/quiz/${dailyPlanId}/submit`, { answers }, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

// ================================
// Task Quiz
// ================================

export interface TaskQuizQuestion {
  id: number;
  questionText: string;
  choices: QuizChoice[];
  selectedChoiceId: number | null;
}

export interface TaskQuizSubject {
  subjectId: number;
  subjectName: string;
}

export interface TaskQuiz {
  planTaskId: number;
  attemptNumber: number;
  questions: TaskQuizQuestion[];
  subject: TaskQuizSubject | null;
  subjects: TaskQuizSubject[];
}

export interface TaskQuizAnswerResult {
  questionId: number;
  isCorrect: boolean;
  correctChoiceId: number;
  reason: string | null;
  explanation?: string | null;
}

export interface TaskQuizResult {
  attemptNumber: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  retryScheduled: boolean;
  taskInvalidated: boolean;
  results: QuizQuestionResult[];
  shiftedTasks: PlanTask[];
}

/**
 * 할일 완료 확인 퀴즈 조회 API 함수 (퀴즈가 없으면 서버가 그 자리에서 AI로 생성)
 * @param taskId 할일 ID
 * @returns 가장 최근 시도의 퀴즈
 */
export const getTaskQuiz = async (taskId: number): Promise<TaskQuiz> => {
  const response = await api.get(`/plan-tasks/${taskId}/quiz`, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

/**
 * 퀴즈 문제 하나 답변 API 함수
 * @param taskId 할일 ID
 * @param questionId 문제 ID
 * @param selectedChoiceId 고른 보기 ID
 * @returns 정답 여부와 틀린 이유
 */
export const answerTaskQuizQuestion = async (taskId: number, questionId: number, selectedChoiceId: number): Promise<TaskQuizAnswerResult> => {
  const response = await api.post(`/plan-tasks/${taskId}/quiz/questions/${questionId}/answer`, { selectedChoiceId }, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

/**
 * 할일 완료 확인 퀴즈 제출 API 함수
 * @param taskId 할일 ID
 * @returns 점수, 통과 여부, 문항별 풀이
 */
export const submitTaskQuiz = async (taskId: number): Promise<TaskQuizResult> => {
  const response = await api.post(`/plan-tasks/${taskId}/quiz/submit`, undefined, { timeout: AI_TIMEOUT_MS });
  return response.data;
};
