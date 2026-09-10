import api from './axios';

// ================================
// Types
// ================================

export type PlanBoardStatus = 'pending' | 'done' | 'failed';

// 백엔드가 아직 배포 전이라 필드명은 잠정 스펙입니다. 실제 응답이 오면 이 타입만 맞추면 됩니다.
export interface PlanBoard {
  id: number;
  title: string;
  subjectId: number;
  subjectName: string;
  textbookId: number;
  textbookName: string;
  chapterId: number;
  chapterName: string;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  status: PlanBoardStatus;
}

export interface CreatePlanBoardInput {
  title: string;
  subjectId: number;
  textbookId: number;
  chapterId: number;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
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
 * @returns 생성된 플랜보드
 */
export const createPlanBoard = async (input: CreatePlanBoardInput): Promise<PlanBoard> => {
  const response = await api.post('/plan-boards', input);
  return response.data;
};
