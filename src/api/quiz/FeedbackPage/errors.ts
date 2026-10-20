import axios from 'axios';

// ================================
// Constants
// ================================

const SUBMIT_ERROR_MESSAGES: Record<string, string> = {
  "FEEDBACK_001": "난이도를 선택해주세요.",
  "FEEDBACK_002": "공부한 시간을 다시 확인해주세요.",
  "FEEDBACK_003": "집중도는 1~5 사이로 선택해주세요.",
  "DAILY_PLAN_NOT_FOUND": "오늘의 학습 계획을 찾을 수 없어요.",
};

const DEFAULT_SUBMIT_ERROR_MESSAGE = "피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.";

// ================================
// Functions
// ================================

/**
 * 피드백 제출 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error submitFeedback() 이 던진 에러
 */
export const getSubmitErrorMessage = (error: unknown) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return SUBMIT_ERROR_MESSAGES[code] ?? DEFAULT_SUBMIT_ERROR_MESSAGE;
};

/**
 * 이미 피드백을 제출했다는 에러인지
 * @param error submitFeedback() 이 던진 에러
 */
export const isAlreadySubmitted = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data?.code === "FEEDBACK_ALREADY_SUBMITTED";
