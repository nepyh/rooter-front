import api from '../../axios';
import { useUserStore } from '@/store';

/**
 * 로그아웃 API 함수. 서버 호출이 실패해도 로컬 로그인 상태는 항상 정리함
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
