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
  setUser: (user: User, token: string, userId: number) => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "bio" | "profileImageUri">>) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

// ================================
// Constants
// ================================

const TOKEN_KEY = "token";
const USER_KEY = "user";
const USER_ID_KEY = "userId";

// ================================
// Components
// ================================

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  userId: null,
  isLogin: false,

  setUser: async (user, token, userId) => {
    set({ user, token, userId, isLogin: true });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
  },
  // TODO: 실제 프로필 저장 API 연동 전까지는 로컬 상태에만 반영합니다.
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  logout: async () => {
    set({ user: null, token: null, userId: null, isLogin: false });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  },
  // 앱 시작 시 저장된 토큰으로 로그인 상태 복원
  restoreSession: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const user = await SecureStore.getItemAsync(USER_KEY);
    const userId = await SecureStore.getItemAsync(USER_ID_KEY);
    if (token && user && userId) {
      set({ user: JSON.parse(user), token, userId: Number(userId), isLogin: true });
    }
  },
}));
