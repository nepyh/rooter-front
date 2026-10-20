import axios from 'axios';

// ================================
// Constants
// ================================

const QUIZ_ERROR_MESSAGES: Record<string, string> = {
  "TASK_QUIZ_NOT_FOUND": "퀴즈가 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.",
  "TASK_QUIZ_ALREADY_SUBMITTED": "이미 채점이 끝난 퀴즈예요.",
  "TASK_QUIZ_INCOMPLETE_ANSWERS": "아직 풀지 않은 문제가 있어요.",
  "TASK_QUIZ_INVALID_ANSWER": "보기를 다시 선택해주세요.",
};

// ================================
// Functions
// ================================

/**
 * 퀴즈 조회·채점 실패 에러를 안내 문구로 변환 (시간 초과, 백엔드 code 순으로 판단)
 * @param error 퀴즈 API 가 던진 에러
 * @param fallback 알 수 없는 code 일 때 보여줄 문구
 */
export const getQuizErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") return "퀴즈를 만드는 데 시간이 오래 걸리고 있어요. 다시 시도해주세요.";
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return QUIZ_ERROR_MESSAGES[code] ?? fallback;
};

/**
 * 이미 답한 문제를 다시 채점하려 했다는 에러인지
 * @param error answerTaskQuizQuestion() 이 던진 에러
 */
export const isAlreadyAnswered = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.data?.code === "TASK_QUIZ_QUESTION_ALREADY_ANSWERED";
