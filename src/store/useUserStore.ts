import { create } from 'zustand';

// ================================
// Styles
// ================================

interface User {
  username: string;
  email: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLogin: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

// ================================
// Components
// ================================

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isLogin: false,

  setUser: (user, token) => set({ user, token, isLogin: true }),
  logout: () => set({ user: null, token: null, isLogin: false }),
}));