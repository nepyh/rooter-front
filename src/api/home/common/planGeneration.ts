import api, { AI_TIMEOUT_MS } from '../../axios';

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
  startDate?: string;
  examDate?: string;
  daysRemaining?: number;
  targetScore?: number;
  isCramMode?: boolean;
}

export interface PlanGenerationTask {
  taskName: string;
  estimatedMinutes: number;
  startTime: string;
  endTime: string;
}

export interface PlanGenerationDaily {
  dailyPlanId: number;
  date: string;
  topics: string[];
  goal: string;
  tasks: PlanGenerationTask[];
}

export interface GeneratedPlan {
  planBoardId: number;
  title: string;
  startDate: string;
  endDate: string;
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
  const response = await api.post('/plan-generation', input, { timeout: AI_TIMEOUT_MS });
  return response.data;
};
