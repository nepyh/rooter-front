import axios from 'axios';

// ================================
// Types
// ================================

/**
 * 화면에 보여줄 인증 에러
 * @param target 에러 문구를 띄울 곳 (입력칸 이름, 또는 toast)
 * @param message 보여줄 문구
 */
export interface AuthError<Target extends string> {
  target: Target;
  message: string;
}

// ================================
// Constants
// ================================

export const SERVER_ERROR: AuthError<'toast'> = { target: 'toast', message: '서버 에러가 발생하였습니다.' };

// ================================
// Functions
// ================================

/**
 * axios 에러에서 HTTP 상태 코드를 꺼냄 (axios 에러가 아니면 undefined)
 * @param error catch 로 받은 에러
 */
export const getStatus = (error: unknown) => {
  if (!axios.isAxiosError(error)) return undefined;

  console.log('==============================');
  console.log('status:', error.response?.status);
  console.log('data:', error.response?.data);
  console.log('message:', error.response?.data?.message);

  return error.response?.status;
};
