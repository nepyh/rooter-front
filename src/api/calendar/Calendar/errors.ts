import axios from 'axios';

// ================================
// Constants
// ================================

const EVENT_ERROR_MESSAGES: Record<string, string> = {
  "CALENDAR_004": "제목은 1~100자로 입력해주세요.",
  "CALENDAR_002": "날짜 형식이 올바르지 않아요.",
  "CALENDAR_EVENT_NOT_FOUND": "이미 삭제되었거나 찾을 수 없는 일정이에요.",
};

// ================================
// Functions
// ================================

/**
 * 개인 일정 추가·수정 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error createCalendarEvent() / updateCalendarEvent() 가 던진 에러
 * @param fallback 알 수 없는 code 일 때 보여줄 문구
 */
export const getEventErrorMessage = (error: unknown, fallback: string) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return EVENT_ERROR_MESSAGES[code] ?? fallback;
};
