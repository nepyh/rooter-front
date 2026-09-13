import axios from 'axios';
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

export default api;