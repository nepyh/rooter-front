import api from '../../axios';
import type { AgreementDecision } from '../../common/agreement';

/**
 * 회원가입 API 함수
 * @param username 이름
 * @param email 이메일
 * @param password 비밀번호
 * @param agreements 가입 시 동의한 약관 (필수 항목은 모두 agreed=true)
 * @returns response.data
 */
export const signup = async (username: string, email: string, password: string, agreements: AgreementDecision[]) => {
  const response = await api.post('/users', { username, email, password, agreements });
  return response.data;
};
