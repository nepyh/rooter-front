import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { clearQueryCache } from '@/api/queryClient';

// ================================
// Styles
// ================================

interface User {
  username: string;
  email: string;
  bio?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  userId: number | null;
  isLogin: boolean;
  setUser: (user: User, token: string, userId: number) => void;
  updateProfile: (patch: Partial<Pick<User, "bio">>) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

// ================================
// Constants
// ================================

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
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  logout: () => {
    set({ user: null, token: null, userId: null, isLogin: false });
    clearQueryCache();
    SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
  },
  restoreSession: async () => {
    try {
      const saved = await SecureStore.getItemAsync(SESSION_KEY);
      if (!saved) return;
      const { user, token, userId } = JSON.parse(saved);
      if (user && token && typeof userId === "number") set({ user, token, userId, isLogin: true });
    } catch {
    }
  },
}));