import api from './axios';

// ================================
// Types
// ================================

export interface PlanBoard {
  id: number;
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  createdAt: string;
}

export interface CreatePlanBoardInput {
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
}

export interface CreatePlanBoardResult {
  id: number;
  message: string;
}

export interface PlanTask {
  id: number;
  taskName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface DailyPlan {
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

// ================================
// Helpers
// ================================

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

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
  const today = toDateString(new Date());
  const boards = await getPlanBoards();
  const current = boards.find((board) => board.startDate <= today && today <= board.endDate);
  if (current) return current;

  const oneYearLater = toDateString(new Date(Date.now() + 365 * 24 * 60 * 60_000));
  const created = await createPlanBoard({ title: '기본 플랜보드', startDate: today, endDate: oneYearLater });
  return { id: created.id, title: '기본 플랜보드', startDate: today, endDate: oneYearLater, createdAt: new Date().toISOString() };
};

/**
 * 일일 태스크 목록 조회 API 함수
 * @param date 조회할 날짜 (yyyy-MM-dd), 생략 시 오늘
 * @returns 해당 날짜의 태스크 목록
 */
export const getDailyTasks = async (date?: string): Promise<DailyPlan> => {
  const response = await api.get('/plan-tasks', { params: date ? { date } : undefined });
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
