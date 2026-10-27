import axios from 'axios';

// ================================
// Constants
// ================================

const REVOKE_ERROR_MESSAGES: Record<string, string> = {
  "REQUIRED_AGREEMENT_MISSING": "필수 약관은 철회할 수 없습니다.",
  "AGREEMENT_VERSION_MISMATCH": "약관이 개정되었습니다. 잠시 후 다시 시도해주세요.",
};

const DEFAULT_REVOKE_ERROR_MESSAGE = "약관 철회에 실패했습니다. 잠시 후 다시 시도해주세요.";

// ================================
// Functions
// ================================

/**
 * 약관 철회 실패 에러를 안내 문구로 변환 (백엔드 code 기준)
 * @param error updateAgreements() 가 던진 에러
 */
export const getRevokeErrorMessage = (error: unknown) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return REVOKE_ERROR_MESSAGES[code] ?? DEFAULT_REVOKE_ERROR_MESSAGE;
};
