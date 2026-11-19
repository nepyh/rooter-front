import { isAxiosError } from 'axios';

// ================================
// Constants
// ================================

const SAVE_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_TITLE": "플랜 이름은 1~100자로 입력해주세요.",
  "INVALID_DESCRIPTION": "플랜 설명은 500자 이하로 입력해주세요.",
  "INVALID_DATE_FORMAT": "날짜를 다시 선택해주세요.",
  "INVALID_DATE_RANGE": "종료일은 시작일보다 늦어야 해요.",
  "PLAN_BOARD_NOT_FOUND": "삭제되었거나 찾을 수 없는 플랜이에요.",
  "FORBIDDEN": "내 플랜만 수정할 수 있어요.",
};

const DEFAULT_SAVE_ERROR_MESSAGE = "플랜을 수정하지 못했습니다. 잠시 후 다시 시도해주세요.";

// ================================
// Functions
// ================================

/**
 * 플랜 수정 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error savePlanBoardEdit() 가 던진 에러
 */
export const getSaveErrorMessage = (error: unknown) => {
  const code = isAxiosError(error) ? error.response?.data?.code : undefined;
  return SAVE_ERROR_MESSAGES[code] ?? DEFAULT_SAVE_ERROR_MESSAGE;
};
