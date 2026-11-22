import axios from 'axios';
import { getStatus, SERVER_ERROR, type AuthError } from '../common';
import { PASSWORD_ERROR_MESSAGE } from '@/utils/common/password';

// ================================
// Types
// ================================

export type SignupErrorTarget = 'username' | 'email' | 'password' | 'toast';

// ================================
// Constants
// ================================

// 백엔드 UserValidationException 의 code 기준. 이름·비밀번호·이메일 길이 오류가 모두 400 이라 status 로는 나눌 수 없음
const SIGNUP_ERRORS: Record<string, AuthError<SignupErrorTarget>> = {
  INVALID_USERNAME: { target: 'username', message: '이름은 12자 이하여야 합니다.' },
  INVALID_PASSWORD_FORMAT: { target: 'password', message: PASSWORD_ERROR_MESSAGE },
  DUPLICATED_EMAIL: { target: 'email', message: '이미 사용 중인 이메일입니다.' },
  EMAIL_TOO_LONG: { target: 'email', message: '이메일은 320자를 초과할 수 없습니다.' },
};

// ================================
// Functions
// ================================

/**
 * 회원가입 실패 에러를 화면에 보여줄 형태로 변환. 백엔드 code 로 입력칸을 고르고, 서버 오류(5xx)는 토스트
 * @param error signup() 또는 가입 직후 login() 이 던진 에러
 * @returns 보여줄 에러, 처리하지 않는 에러면 null
 */
export const getSignupError = (error: unknown): AuthError<SignupErrorTarget> | null => {
  if (!axios.isAxiosError(error)) return null;

  const code = error.response?.data?.code;
  if (typeof code === 'string' && SIGNUP_ERRORS[code]) return SIGNUP_ERRORS[code];

  const status = getStatus(error);
  return status !== undefined && status >= 500 ? SERVER_ERROR : null;
};
