import { getStatus, SERVER_ERROR, type AuthError } from '../common';

// ================================
// Types
// ================================

export type LoginErrorTarget = 'password' | 'toast';

// ================================
// Constants
// ================================

const LOGIN_MISMATCH_ERROR: AuthError<LoginErrorTarget> = {
  target: 'password',
  message: '이메일 또는 비밀번호가 일치하지 않습니다.\n다시 확인해주세요.',
};

const LOGIN_ERRORS: Record<number, AuthError<LoginErrorTarget>> = {
  401: LOGIN_MISMATCH_ERROR,
  404: LOGIN_MISMATCH_ERROR,
  500: SERVER_ERROR,
};

// ================================
// Functions
// ================================

/**
 * 로그인 실패 에러를 화면에 보여줄 형태로 변환
 * @param error login() 이 던진 에러
 * @returns 보여줄 에러, 처리하지 않는 에러면 null
 */
export const getLoginError = (error: unknown): AuthError<LoginErrorTarget> | null => {
  const status = getStatus(error);
  return (status && LOGIN_ERRORS[status]) || null;
};
