import api, { AI_TIMEOUT_MS } from '../../axios';
import type { PlanTask } from '../../common/planBoard';

// ================================
// Types
// ================================

export interface ChatReply {
  reply: string;
  planChanged: boolean;
  updatedTasks: PlanTask[] | null;
  movedTasks: PlanTask[] | null;
}

export type ChatTurnFeedback = 'LIKE' | 'DISLIKE';

export interface ChatTurn {
  id: number;
  sessionId: number;
  dailyPlanId: number;
  role: string;
  content: string;
  feedback: ChatTurnFeedback | null;
  createdAt: string;
}

export interface ChatSession {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
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

/**
 * 챗봇 세션(대화 목록) 조회 API 함수
 * @returns 최근 대화순 세션 목록
 */
export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

/**
 * 챗봇 세션의 대화 내용 조회 API 함수
 * @param sessionId 세션 ID
 * @returns 시간순 대화 목록
 */
export const getChatSessionTurns = async (sessionId: number): Promise<ChatTurn[]> => {
  const response = await api.get(`/chat/sessions/${sessionId}/turns`);
  return response.data;
};
