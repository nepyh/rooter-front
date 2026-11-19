import api from '../axios';
import { queryClient, queryKeys } from '../queryClient';
import { toLocalDateString } from '@/utils/common/date';

// ================================
// Types
// ================================

export interface PlanBoard {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  examDate: string | null;
  isArchived: boolean;
  isRepresentative: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanBoardInput {
  title: string;
  startDate: string;
  endDate: string;
  examDate?: string;
  description?: string;
}

export interface UpdatePlanBoardInput {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  examDate?: string;
  isArchived?: boolean;
}

export interface CreatePlanBoardResult {
  id: number;
  message: string;
}

export type PlanTaskStatus = "PENDING" | "DONE" | "FAILED";

export interface PlanTask {
  id: number;
  dailyPlanId: number;
  planBoardId: number;
  isManual: boolean;
  taskName: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  status: PlanTaskStatus;
  subjectId?: number | null;
  subjectName?: string | null;
}

export interface DailyPlan {
  dailyPlanId?: number | null;
  planDate: string;
  tasks: PlanTask[];
}

export interface CreatePlanTaskInput {
  planBoardId: number;
  planDate: string;
  taskName: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  textbookId?: number;
}

export interface UpdatePlanTaskInput {
  taskName?: string;
  startTime?: string;
  endTime?: string;
  estimatedMinutes?: number;
  status?: PlanTaskStatus;
}

export interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  days: DailyPlan[];
}

/**
 * 플랜보드 목록 조회 API 함수. 최근에 만든 보드가 앞에 오고, 보관한 보드는 빠짐
 * @returns 플랜보드 배열
 */
export const getPlanBoards = async (): Promise<PlanBoard[]> => {
  const response = await api.get('/plan-boards');
  return response.data;
};

/**
 * 플랜보드 생성 API 함수
 * @param input 생성할 플랜보드 정보, description 은 500자 이하
 * @returns 생성된 플랜보드 id와 메시지
 */
export const createPlanBoard = async (input: CreatePlanBoardInput): Promise<CreatePlanBoardResult> => {
  const response = await api.post('/plan-boards', input);
  return response.data;
};

/**
 * 플랜보드 수정 API 함수. 보낸 필드만 바뀌고, description 에 빈 문자열을 보내면 설명이 지워짐
 * @param boardId 플랜보드 ID
 * @param input 수정할 필드
 * @returns 수정된 플랜보드
 */
export const updatePlanBoard = async (boardId: number, input: UpdatePlanBoardInput): Promise<PlanBoard> => {
  const response = await api.patch(`/plan-boards/${boardId}`, input);
  return response.data;
};

/**
 * 대표 플랜 설정 API 함수. 대표는 계정에 하나라 기존 대표는 서버가 자동으로 내림
 * @param boardId 대표로 고를 플랜보드 ID
 * @returns 대표로 설정된 플랜보드
 */
export const setRepresentativePlanBoard = async (boardId: number): Promise<PlanBoard> => {
  const response = await api.put(`/plan-boards/${boardId}/representative`);
  return response.data;
};

/**
 * 대표 플랜 해제 API 함수. 대표가 아닌 보드에 호출해도 성공
 * @param boardId 대표에서 내릴 플랜보드 ID
 */
export const unsetRepresentativePlanBoard = async (boardId: number): Promise<void> => {
  await api.delete(`/plan-boards/${boardId}/representative`);
};

/**
 * 오늘 날짜가 포함된 플랜보드를 찾고, 없으면 새로 만드는 API 함수
 * @returns 오늘 기준으로 쓸 플랜보드
 */
export const getOrCreateCurrentPlanBoard = async (): Promise<PlanBoard> => {
  const today = toLocalDateString(new Date());
  const boards = await getPlanBoards();
  const current = boards.find((board) => board.examDate === null && board.startDate <= today && today <= board.endDate);
  if (current) return current;

  const oneYearLater = toLocalDateString(new Date(Date.now() + 365 * 24 * 60 * 60_000));
  const created = await createPlanBoard({ title: '기본 플랜보드', startDate: today, endDate: oneYearLater });
  const now = new Date().toISOString();
  return {
    id: created.id,
    title: '기본 플랜보드',
    description: null,
    startDate: today,
    endDate: oneYearLater,
    examDate: null,
    isArchived: false,
    isRepresentative: false,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * 플랜보드 목록을 캐시에서 꺼내고, 없거나 오래됐으면 서버에서 받아옴. 여러 화면이 같은 목록을 함께 씀
 * @returns 플랜보드 배열
 */
export const fetchCachedPlanBoards = () =>
  queryClient.fetchQuery({ queryKey: queryKeys.boards.list, queryFn: getPlanBoards });

/**
 * 일일 태스크 목록 조회 API 함수
 * @param date 조회할 날짜 (yyyy-MM-dd), 생략 시 오늘
 * @returns 해당 날짜의 태스크 목록
 */
export const getDailyTasks = async (date?: string): Promise<DailyPlan> => {
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
 * @param input 생성할 태스크 정보, textbookId 를 보내면 서버가 그 교과서의 과목을 태스크에 붙임
 */
export const createPlanTask = async (input: CreatePlanTaskInput): Promise<void> => {
  await api.post('/plan-tasks', input);
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
