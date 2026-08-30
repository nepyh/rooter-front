import { create } from 'zustand';

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
  isLogin: boolean;
  setUser: (user: User) => void;
  updateProfile: (patch: Partial<Pick<User, "bio" | "profileImageUri">>) => void;
  logout: () => void;
}

// ================================
// Components
// ================================

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLogin: false,

  setUser: (user) => set({ user, isLogin: true }),
  // TODO: 실제 프로필 저장 API 연동 전까지는 로컬 상태에만 반영합니다.
  updateProfile: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  logout: () => set({ user: null, isLogin: false }),
}));