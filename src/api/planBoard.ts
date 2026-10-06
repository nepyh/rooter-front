import api from './axios';
import { toLocalDateString } from '@/utils/date';

// ================================
// Types
// ================================

export interface PlanBoard {
  id: number;
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  examDate: string | null; // yyyy-MM-dd
  createdAt: string;
}

export interface CreatePlanBoardInput {
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  examDate?: string; // yyyy-MM-dd
}

export interface CreatePlanBoardResult {
  id: number;
  message: string;
}

export interface PlanTask {
  id: number;
  dailyPlanId: number;
  taskName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface DailyPlan {
  dailyPlanId?: number | null;
  planDate: string; // yyyy-MM-dd
  tasks: PlanTask[];
}

export interface CreatePlanTaskInput {
  planBoardId: number;
  planDate: string; // yyyy-MM-dd
  taskName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedMinutes: number;
}

export interface UpdatePlanTaskInput {
  taskName?: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  estimatedMinutes?: number;
}

export interface WeeklyPlan {
  weekStart: string; // yyyy-MM-dd
  weekEnd: string; // yyyy-MM-dd
  days: DailyPlan[];
}

/**
 * 플랜보드 목록 조회 API 함수
 * @returns 플랜보드 배열
 */
export const getPlanBoards = async (): Promise<PlanBoard[]> => {
  const response = await api.get('/plan-boards');
  return response.data;
};

/**
 * 플랜보드 생성 API 함수
 * @param input 생성할 플랜보드 정보
 * @returns 생성된 플랜보드 id와 메시지
 */
export const createPlanBoard = async (input: CreatePlanBoardInput): Promise<CreatePlanBoardResult> => {
  const response = await api.post('/plan-boards', input);
  return response.data;
};

/**
 * 오늘 날짜가 포함된 플랜보드를 찾고, 없으면 새로 만드는 API 함수
 * @returns 오늘 기준으로 쓸 플랜보드
 */
export const getOrCreateCurrentPlanBoard = async (): Promise<PlanBoard> => {
  const today = toLocalDateString(new Date());
  const boards = await getPlanBoards();
  // AI 계획 보드(시험일 있음)와 섞이지 않게 시험일 없는 기본 보드만 사용
  const current = boards.find((board) => board.examDate === null && board.startDate <= today && today <= board.endDate);
  if (current) return current;

  const oneYearLater = toLocalDateString(new Date(Date.now() + 365 * 24 * 60 * 60_000));
  const created = await createPlanBoard({ title: '기본 플랜보드', startDate: today, endDate: oneYearLater });
  return { id: created.id, title: '기본 플랜보드', startDate: today, endDate: oneYearLater, examDate: null, createdAt: new Date().toISOString() };
};

/**
 * 플랜보드별 오늘 계획 조회 API 함수
 * @param boardId 플랜보드 ID
 * @returns 그 보드의 오늘 dailyPlanId와 태스크
 */
export const getBoardDaily = async (boardId: number): Promise<DailyPlan> => {
  const response = await api.get(`/plan-boards/${boardId}/daily`);
  return response.data;
};

/**
 * 일일 태스크 목록 조회 API 함수
 * @param date 조회할 날짜 (yyyy-MM-dd), 생략 시 오늘
 * @returns 해당 날짜의 태스크 목록
 */
export const getDailyTasks = async (date?: string): Promise<DailyPlan> => {
  // 서버의 오늘이 UTC 기준이라 날짜 생략 시 기기 기준 오늘 날짜 전달
  const response = await api.get('/plan-tasks', { params: { date: date ?? toLocalDateString(new Date()) } });
  return response.data;
};

/**
 * 할 일 탭 주간 과제 목록 조회 API 함수
 * @param date 이 날짜가 속한 주(월~일)를 조회, 생략 시 오늘이 속한 주
 * @returns 주간 시작/종료일과 요일별 태스크 목록
 */
export const getWeeklyTasks = async (date?: string): Promise<WeeklyPlan> => {
  const response = await api.get('/plan-tasks/week', { params: { date: date ?? toLocalDateString(new Date()) } });
  return response.data;
};

/**
 * 태스크 생성 API 함수
 * @param input 생성할 태스크 정보
 */
export const createPlanTask = async (input: CreatePlanTaskInput): Promise<void> => {
  await api.post('/plan-tasks', input);
};

/**
 * 태스크 완료 처리/취소 API 함수
 * @param taskId 태스크 ID
 * @param isCompleted 완료 여부
 * @returns 갱신된 태스크
 */
export const completeTask = async (taskId: number, isCompleted: boolean): Promise<PlanTask> => {
  const response = await api.patch(`/plan-tasks/${taskId}/complete`, { isCompleted });
  return response.data;
};

/**
 * 태스크 수정 API 함수
 * @param taskId 태스크 ID
 * @param input 수정할 필드
 * @returns 수정된 태스크
 */
export const updatePlanTask = async (taskId: number, input: UpdatePlanTaskInput): Promise<PlanTask> => {
  const response = await api.patch(`/plan-tasks/${taskId}`, input);
  return response.data;
};

/**
 * 태스크 삭제 API 함수
 * @param taskId 태스크 ID
 */
export const deletePlanTask = async (taskId: number): Promise<void> => {
  await api.delete(`/plan-tasks/${taskId}`);
};
