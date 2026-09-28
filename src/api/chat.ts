import api, { AI_TIMEOUT_MS } from './axios';
import type { PlanTask } from './planBoard';

// ================================
// Types
// ================================

export interface ChatReply {
  reply: string;
  planChanged: boolean;
  updatedTasks: PlanTask[] | null;
}

export interface ChatTurn {
  role: string;
  content: string;
  createdAt: string;
}

/**
 * 챗봇 메시지 전송 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @param message 보낼 메시지
 * @returns AI 답변과 계획 변경 여부
 */
export const sendChatMessage = async (dailyPlanId: number, message: string): Promise<ChatReply> => {
  const response = await api.post(`/daily-plans/${dailyPlanId}/chat/message`, { message }, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

/**
 * 챗봇 대화 이력 조회 API 함수
 * @param dailyPlanId 일일 계획 ID
 * @returns 시간순 대화 목록
 */
export const getChatHistory = async (dailyPlanId: number): Promise<ChatTurn[]> => {
  const response = await api.get(`/daily-plans/${dailyPlanId}/chat`);
  return response.data;
};
