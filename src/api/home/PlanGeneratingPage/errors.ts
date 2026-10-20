import axios from 'axios';

// ================================
// Constants
// ================================

const GENERATE_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_DATE_RANGE": "시험일은 내일 이후로 선택해주세요.",
  "MISSING_DATE_INFO": "시험 날짜를 다시 선택해주세요.",
  "INVALID_DATE_FORMAT": "시험 날짜를 다시 선택해주세요.",
  "SUBJECTS_REQUIRED": "목차를 하나 이상 선택해주세요.",
  "INVALID_SUBJECT_RANGE": "선택한 목차 범위를 다시 확인해주세요.",
  "INVALID_TITLE": "계획 이름이 올바르지 않아요.",
  "GENERATION_FAILED": "AI가 계획을 만들지 못했어요. 잠시 후 다시 시도해주세요.",
};

const DEFAULT_GENERATE_ERROR_MESSAGE = "학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";

// ================================
// Functions
// ================================

/**
 * 계획 생성 실패 에러를 안내 문구로 변환 (시간 초과·네트워크·백엔드 code 순으로 판단)
 * @param error generatePlan() 이 던진 에러
 */
export const getGenerateErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return DEFAULT_GENERATE_ERROR_MESSAGE;
  if (error.code === "ECONNABORTED") return "계획을 만드는 데 시간이 너무 오래 걸렸어요. 잠시 후 다시 시도해주세요.";
  if (!error.response) return "인터넷 연결을 확인해주세요.";
  return GENERATE_ERROR_MESSAGES[error.response.data?.code] ?? DEFAULT_GENERATE_ERROR_MESSAGE;
};
