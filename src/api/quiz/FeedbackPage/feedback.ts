import api, { AI_TIMEOUT_MS } from '../../axios';

// ================================
// Types
// ================================

export type Difficulty = "쉬움" | "적당" | "어려움";

export interface SubmitFeedbackInput {
  difficulty: Difficulty;
  timeSpentMinutes?: number;
  focusLevel?: number;
}

export interface AdjustmentTask {
  dailyPlanId: number;
  planDate: string;
  taskName: string;
}

export interface Feedback {
  id: number;
  dailyPlanId: number;
  planTaskId?: number | null;
  difficulty: string;
  timeSpentMinutes?: number | null;
  focusLevel?: number | null;
  createdAt: string;
  insertedAdjustmentTasks?: AdjustmentTask[];
}

/**
 * 일일 학습 피드백 설문 제출 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @param input 난이도/소요시간/집중도
 * @returns 제출된 피드백 (오답 기반으로 추가된 보충 태스크 포함)
 */
export const submitFeedback = async (dailyPlanId: number, input: SubmitFeedbackInput): Promise<Feedback> => {
  const response = await api.post(`/daily-plans/${dailyPlanId}/feedback`, input, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

/**
 * 일일 학습 피드백 설문 조회 API 함수
 * 서버는 그날 제출된 설문 목록을 주고(할 일 단위 설문 포함), 하루 설문은 planTaskId 가 없는 행
 * @param dailyPlanId 일일 계획 ID
 * @returns 그날 제출한 하루 설문, 아직 안 냈으면 null
 */
export const getFeedback = async (dailyPlanId: number): Promise<Feedback | null> => {
  const response = await api.get<Feedback[]>(`/daily-plans/${dailyPlanId}/feedback`);
  return response.data.find((feedback) => feedback.planTaskId == null) ?? null;
};
