import api from '../../axios';
import { useUserStore } from '@/store';
import { decodeJwtPayload } from '@/utils/auth/jwt';
import { syncPushToken } from '@/api/common/notification';
import { getUserInfo } from '@/api/common/user';

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
  syncPushToken();

  return response.data;
};

/**
 * 로그인한 사용자가 처음 보게 할 화면
 * 학교를 아직 저장하지 않은 계정(가입 중 학교 선택·설문을 끝내지 않고 나간 경우)은 학교 선택으로, 나머지는 홈으로 보냄
 * 내 정보를 못 불러오면 로그인한 사용자를 막지 않도록 홈으로 보냄
 * @param userId 로그인한 유저 ID
 */
export const getStartPath = async (userId: number) => {
  try {
    const { schoolId } = await getUserInfo(userId);
    return schoolId ? "/Home/Home" as const : "/Auth/SchoolSelect" as const;
  } catch {
    return "/Home/Home" as const;
  }
};
