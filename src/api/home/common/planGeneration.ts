import api, { AI_TIMEOUT_MS } from '../../axios';
import type { PlanGenerationStatus } from '@/api/common/planBoard';

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
  examEndDate?: string;
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
  examEndDate?: string | null;
  isCramMode: boolean;
  /** 지금까지 만든 날만 (앞 구간). 남은 기간은 서버가 이어서 만들고, 만들어지는 대로 일일 계획 조회에 나타남 */
  dailyPlans: PlanGenerationDaily[];
  tips: string[];
  /** 없으면 COMPLETED (옛 서버 응답) */
  generationStatus?: PlanGenerationStatus;
  generatedUntil?: string | null;
}

export interface PlanGenerationRetryResult {
  planBoardId: number;
  generationStatus: PlanGenerationStatus;
  generatedUntil: string;
}

/**
 * AI 학습 계획 생성 API 함수
 * @param input 제목/과목 범위/시험일 등 계획 조건. examEndDate(시험 마지막 날)는 examDate 가 있어야 하고 그보다 앞설 수 없으며, 생략하면 하루짜리 시험
 * @returns 생성된 플랜보드와 일자별 계획
 */
export const generatePlan = async (input: GeneratePlanInput): Promise<GeneratedPlan> => {
  const response = await api.post('/plan-generation', input, { timeout: AI_TIMEOUT_MS });
  return response.data;
};

/**
 * 남은 기간을 만들지 못한(generationStatus=FAILED) 플랜의 계획을 다시 만들기 시작하는 API 함수.
 * 이미 만든 날은 그대로 두고 그 다음 날부터 서버가 이어서 만들며, 응답은 바로 옴 (GENERATING)
 * @param planBoardId 다시 만들 플랜보드 ID
 * @returns 다시 만들기 시작한 상태
 */
export const retryPlanGeneration = async (planBoardId: number): Promise<PlanGenerationRetryResult> => {
  const response = await api.post(`/plan-generation/${planBoardId}/retry`);
  return response.data;
};
