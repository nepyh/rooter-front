import axios from 'axios';

// ================================
// Constants
// ================================

const EDIT_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_TASK_NAME": "일정 이름을 다시 확인해주세요.",
  "INVALID_TIME_RANGE": "종료 시간은 시작 시간보다 늦어야 해요. 자정을 넘기는 일정은 저장할 수 없어요.",
  "INVALID_TIME_FORMAT": "시간 형식이 올바르지 않아요.",
  "INVALID_ESTIMATED_MINUTES": "소요 시간을 다시 확인해주세요.",
};

const DEFAULT_EDIT_ERROR_MESSAGE = "일정 수정에 실패했습니다. 잠시 후 다시 시도해주세요.";

// ================================
// Functions
// ================================

/**
 * 일정 수정 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error updatePlanTask() 가 던진 에러
 */
export const getEditErrorMessage = (error: unknown) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return EDIT_ERROR_MESSAGES[code] ?? DEFAULT_EDIT_ERROR_MESSAGE;
};

const CHAT_SEND_ERROR_MESSAGES: Record<string, string> = {
  "CHAT_SESSION_NOT_FOUND": "삭제되었거나 찾을 수 없는 대화예요. 새 채팅에서 다시 물어봐주세요.",
};

const DEFAULT_CHAT_SEND_ERROR_MESSAGE = "답변을 받지 못했어요. 잠시 후 다시 시도해주세요.";

const CHAT_FEEDBACK_ERROR_MESSAGES: Record<string, string> = {
  "CHAT_TURN_NOT_FOUND": "삭제되었거나 찾을 수 없는 답변이에요.",
  "CHAT_FEEDBACK_NOT_ALLOWED": "챗봇 답변에만 좋아요·싫어요를 누를 수 있어요.",
};

const DEFAULT_CHAT_FEEDBACK_ERROR_MESSAGE = "평가를 저장하지 못했어요. 잠시 후 다시 시도해주세요.";

/**
 * 챗봇 메시지 전송 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error sendChatMessage() 가 던진 에러
 */
export const getChatSendErrorMessage = (error: unknown) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return CHAT_SEND_ERROR_MESSAGES[code] ?? DEFAULT_CHAT_SEND_ERROR_MESSAGE;
};

/**
 * 챗봇 답변 좋아요/싫어요 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error updateChatTurnFeedback() 가 던진 에러
 */
export const getChatFeedbackErrorMessage = (error: unknown) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return CHAT_FEEDBACK_ERROR_MESSAGES[code] ?? DEFAULT_CHAT_FEEDBACK_ERROR_MESSAGE;
};
