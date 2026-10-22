import { create } from 'zustand';
import type { PlanGenerationSubjectInput } from '@/api/home/common/planGeneration';

// ================================
// Types
// ================================

interface PlanDraftState {
  subjectsByTextbook: Record<number, PlanGenerationSubjectInput[]>;
  setTextbookSubjects: (textbookId: number, subjects: PlanGenerationSubjectInput[]) => void;
  reset: () => void;
}

// ================================
// Store
// ================================

/**
 * 플랜 만들기 중 교과서별로 고른 목차. 교과서 선택 ↔ 목차 선택을 오가며 모아 두었다가 수면 시간 화면으로 넘길 때 씀
 */
export const usePlanDraftStore = create<PlanDraftState>((set) => ({
  subjectsByTextbook: {},
  setTextbookSubjects: (textbookId, subjects) =>
    set((state) => ({ subjectsByTextbook: { ...state.subjectsByTextbook, [textbookId]: subjects } })),
  reset: () => set({ subjectsByTextbook: {} }),
}));
