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
  isLogin: boolean;
  setUser: (user: User) => void;
}

// ================================
// Components
// ================================

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLogin: false,

  setUser: (user) => set({ user, isLogin: true }),
}));