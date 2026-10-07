import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ================================
// Styles
// ================================

interface User {
  username: string;
  email: string;
  bio?: string;
  profileImageUri?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  userId: number | null;
  isLogin: boolean;
  setUser: (user: User, token: string, userId: number) => void;
  updateProfile: (patch: Partial<Pick<User, "bio" | "profileImageUri">>) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

// ================================
// Constants
// ================================

// 새로고침·앱 재실행에도 로그인 유지용 기기 안전 저장소 키
const SESSION_KEY = "session";

// ================================
// Components
// ================================

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  userId: null,
  isLogin: false,

  setUser: (user, token, userId) => {
    set({ user, token, userId, isLogin: true });
    SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user, token, userId })).catch(() => {});
  },
  // TODO: 실제 프로필 저장 API 연동 전까지는 로컬 상태에만 반영합니다.
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  logout: () => {
    set({ user: null, token: null, userId: null, isLogin: false });
    SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
  },
  // 앱 시작 시 저장된 로그인 정보 복원, 토큰이 만료됐으면 첫 API 401에서 axios가 로그아웃 처리
  restoreSession: async () => {
    try {
      const saved = await SecureStore.getItemAsync(SESSION_KEY);
      if (!saved) return;
      const { user, token, userId } = JSON.parse(saved);
      if (user && token && typeof userId === "number") set({ user, token, userId, isLogin: true });
    } catch {
      // 저장소를 못 읽으면 로그아웃 상태로 시작
    }
  },
}));