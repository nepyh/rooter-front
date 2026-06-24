import api from './axios';

/**
 * 회원가입 API 함수
 * @param username 이름
 * @param email 이메일
 * @param password 비밀번호
 * @returns response.data
 */
export const signup = async (username: string, email: string, password: string) => {
  const response = await api.post('/users', { username, email, password });
  return response.data;
};

/**
 * 로그인 API 함수
 * @param email 이메일
 * @param password 비밀번호
 * @returns response.data
 */
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};