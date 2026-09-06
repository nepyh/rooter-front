import { create } from 'zustand';

// ================================
// Types
// ================================

interface UIState {
  isFullScreenModalOpen: boolean;
  setFullScreenModalOpen: (open: boolean) => void;
}

// ================================
// Store
// ================================

// 하단 NavBar 위에 전체화면 모달(플랜보드 추가 등)이 떠 있는 동안 NavBar를 숨기기 위한 전역 상태입니다.
export const useUIStore = create<UIState>((set) => ({
  isFullScreenModalOpen: false,
  setFullScreenModalOpen: (open) => set({ isFullScreenModalOpen: open }),
}));
