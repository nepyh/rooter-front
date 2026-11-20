import { create } from 'zustand';
import type { PlanGenerationSubjectInput } from '@/api/home/common/planGeneration';

// ================================
// Types
// ================================

interface PlanDraftState {
  title: string;
  description: string;
  examStartDate: string | null;
  examEndDate: string | null;
  subjectsByTextbook: Record<number, PlanGenerationSubjectInput[]>;
  setInfo: (title: string, description: string) => void;
  setExamStartDate: (date: string) => void;
  setExamEndDate: (date: string) => void;
  setTextbookSubjects: (textbookId: number, subjects: PlanGenerationSubjectInput[]) => void;
  reset: () => void;
}

// ================================
// Store
// ================================

/**
 * 플랜 만들기 중 입력한 내용. 플랜 정보 화면의 이름·설명, 시험 시작·종료 날짜 화면에서 고른 날짜(YYYY-MM-DD)와,
 * 교과서 선택 ↔ 목차 선택을 오가며 교과서별로 고른 목차를 모아 두었다가 플랜 생성 화면에서 씀
 * 시험 시작일을 고른 종료일보다 늦은 날로 바꾸면 종료일은 지움
 */
export const usePlanDraftStore = create<PlanDraftState>((set) => ({
  title: '',
  description: '',
  examStartDate: null,
  examEndDate: null,
  subjectsByTextbook: {},
  setInfo: (title, description) => set({ title, description }),
  setExamStartDate: (date) =>
    set((state) => ({ examStartDate: date, examEndDate: state.examEndDate !== null && state.examEndDate >= date ? state.examEndDate : null })),
  setExamEndDate: (date) => set({ examEndDate: date }),
  setTextbookSubjects: (textbookId, subjects) =>
    set((state) => ({ subjectsByTextbook: { ...state.subjectsByTextbook, [textbookId]: subjects } })),
  reset: () => set({ title: '', description: '', examStartDate: null, examEndDate: null, subjectsByTextbook: {} }),
}));
