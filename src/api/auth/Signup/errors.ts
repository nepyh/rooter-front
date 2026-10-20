import { getStatus, SERVER_ERROR, type AuthError } from '../common';
import { PASSWORD_ERROR_MESSAGE } from '@/utils/common/password';

// ================================
// Types
// ================================

export type SignupErrorTarget = 'username' | 'email' | 'password' | 'toast';

// ================================
// Constants
// ================================

const SIGNUP_ERRORS: Record<number, AuthError<SignupErrorTarget>> = {
  400: { target: 'username', message: '이름은 12자 이하여야 합니다.' },
  406: { target: 'password', message: PASSWORD_ERROR_MESSAGE },
  409: { target: 'email', message: '이미 사용 중인 이메일입니다.' },
  500: SERVER_ERROR,
};

// ================================
// Functions
// ================================

/**
 * 회원가입 실패 에러를 화면에 보여줄 형태로 변환
 * @param error signup() 또는 가입 직후 login() 이 던진 에러
 * @returns 보여줄 에러, 처리하지 않는 에러면 null
 */
export const getSignupError = (error: unknown): AuthError<SignupErrorTarget> | null => {
  const status = getStatus(error);
  return (status && SIGNUP_ERRORS[status]) || null;
};
