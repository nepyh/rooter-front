import axios from 'axios';
import { router } from 'expo-router';
import { useUserStore } from '@/store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로그인 후 발급받는 JWT를 모든 요청에 자동으로 실어 보냅니다.
// 플랜보드 등 인증이 필요한 API는 이 헤더가 없으면 401을 받습니다.
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 만료·무효(code=UNAUTHORIZED) 시 로그아웃 후 첫 화면 이동
// BAD_CREDENTIALS, WRONG_CURRENT_PASSWORD 같은 다른 401은 각 화면에서 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401 && error.response?.data?.code === 'UNAUTHORIZED';
    if (isUnauthorized && useUserStore.getState().isLogin) {
      useUserStore.getState().logout();
      router.replace({ pathname: '/', params: { toast: 'session-expired' } });
    }
    return Promise.reject(error);
  },
);

export default api;