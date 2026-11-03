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
  sessionId: number;
  sessionTitle: string | null;
  userTurnId: number;
  assistantTurnId: number;
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
 * @param dailyPlanId 일일 계획 ID (어느 날 계획을 보고 고칠지)
 * @param message 보낼 메시지
 * @param sessionId 메시지를 이어 붙일 세션 ID. null 이면 서버가 그날 마지막 세션에 붙이거나 새로 만듦
 * @returns AI 답변, 계획 변경 여부, 세션 ID·제목, 방금 저장된 질문·답변 ID
 */
export const sendChatMessage = async (dailyPlanId: number, message: string, sessionId: number | null): Promise<ChatReply> => {
  const response = await api.post(
    `/daily-plans/${dailyPlanId}/chat/message`,
    { message, ...(sessionId !== null && { sessionId }) },
    { timeout: AI_TIMEOUT_MS },
  );
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

/**
 * 챗봇 새 세션(새 대화) 생성 API 함수
 * @returns 만들어진 세션 (첫 메시지 전이라 title 은 null)
 */
export const createChatSession = async (): Promise<ChatSession> => {
  const response = await api.post('/chat/sessions');
  return response.data;
};

/**
 * 챗봇 답변 좋아요/싫어요 API 함수
 * @param turnId 챗봇 답변 ID (사용자 메시지에는 누를 수 없음)
 * @param feedback LIKE / DISLIKE, null 이면 취소
 * @returns 바뀐 메시지
 */
export const updateChatTurnFeedback = async (turnId: number, feedback: ChatTurnFeedback | null): Promise<ChatTurn> => {
  const response = await api.put(`/chat/turns/${turnId}/feedback`, { feedback });
  return response.data;
};

/**
 * 챗봇 세션 삭제 API 함수
 * @param sessionId 지울 세션 ID
 */
export const deleteChatSession = async (sessionId: number): Promise<void> => {
  await api.delete(`/chat/sessions/${sessionId}`);
};
