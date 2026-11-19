import { create } from 'zustand';
import type { PlanGenerationSubjectInput } from '@/api/home/common/planGeneration';

// ================================
// Types
// ================================

interface PlanDraftState {
  title: string;
  description: string;
  subjectsByTextbook: Record<number, PlanGenerationSubjectInput[]>;
  setInfo: (title: string, description: string) => void;
  setTextbookSubjects: (textbookId: number, subjects: PlanGenerationSubjectInput[]) => void;
  reset: () => void;
}

// ================================
// Store
// ================================

/**
 * 플랜 만들기 중 입력한 내용. 플랜 정보 화면의 이름·설명과, 교과서 선택 ↔ 목차 선택을 오가며 교과서별로 고른 목차를 모아 두었다가
 * 플랜 생성 화면에서 씀
 */
export const usePlanDraftStore = create<PlanDraftState>((set) => ({
  title: '',
  description: '',
  subjectsByTextbook: {},
  setInfo: (title, description) => set({ title, description }),
  setTextbookSubjects: (textbookId, subjects) =>
    set((state) => ({ subjectsByTextbook: { ...state.subjectsByTextbook, [textbookId]: subjects } })),
  reset: () => set({ title: '', description: '', subjectsByTextbook: {} }),
}));
