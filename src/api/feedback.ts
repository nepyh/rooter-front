import api from './axios';

// ================================
// Types
// ================================

// difficulty 허용 값은 스펙에 문자열로만 명시(enum 미공개) — 실제 값은 백엔드에 확인 필요
export interface SubmitFeedbackInput {
  difficulty: string;
  timeSpentMinutes?: number;
  focusLevel?: number; // 1~5
}

export interface AdjustmentTask {
  dailyPlanId: number;
  planDate: string; // yyyy-MM-dd
  taskName: string;
}

export interface Feedback {
  id: number;
  dailyPlanId: number;
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
  const response = await api.post(`/daily-plans/${dailyPlanId}/feedback`, input);
  return response.data;
};

/**
 * 일일 학습 피드백 설문 조회 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @returns 제출된 피드백
 */
export const getFeedback = async (dailyPlanId: number): Promise<Feedback> => {
  const response = await api.get(`/daily-plans/${dailyPlanId}/feedback`);
  return response.data;
};
