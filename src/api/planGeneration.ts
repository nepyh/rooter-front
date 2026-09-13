import api from './axios';

// ================================
// Types
// ================================

export interface PlanGenerationSubjectInput {
  textbookId: number;
  startChapterId: number;
  endChapterId: number;
  customRangeText?: string;
}

export interface GeneratePlanInput {
  title: string;
  subjects: PlanGenerationSubjectInput[];
  startDate?: string; // yyyy-MM-dd
  examDate?: string; // yyyy-MM-dd
  daysRemaining?: number;
  targetScore?: number;
  isCramMode?: boolean;
}

export interface PlanGenerationTask {
  taskName: string;
  estimatedMinutes: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface PlanGenerationDaily {
  dailyPlanId: number;
  date: string; // yyyy-MM-dd
  topics: string[];
  goal: string;
  tasks: PlanGenerationTask[];
}

export interface GeneratedPlan {
  planBoardId: number;
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  examDate?: string | null;
  isCramMode: boolean;
  dailyPlans: PlanGenerationDaily[];
  tips: string[];
}

/**
 * AI 학습 계획 생성 API 함수
 * @param input 제목/과목 범위/시험일 등 계획 조건
 * @returns 생성된 플랜보드와 일자별 계획
 */
export const generatePlan = async (input: GeneratePlanInput): Promise<GeneratedPlan> => {
  const response = await api.post('/plan-generation', input);
  return response.data;
};
