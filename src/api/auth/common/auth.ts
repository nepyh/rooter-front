import api from '../../axios';
import { useUserStore } from '@/store';
import { decodeJwtPayload } from '@/utils/jwt';

/**
 * 로그인 API 함수
 * @param email 이메일
 * @param password 비밀번호
 * @returns response.data
 */
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });

  const { username: userName, email: userEmail, token } = response.data;
  const userId = decodeJwtPayload(token).userId as number;
  useUserStore.getState().setUser(
    { username: userName, email: userEmail },
    token,
    userId
  );

  return response.data;
};

/**
 * 로그아웃 API 함수
 * @returns response.data
 */
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } finally {
    useUserStore.getState().logout();
  }
};
