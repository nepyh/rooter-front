import api from '../../axios';
import { getTextbookDetail } from '../common/catalog';
import type { TextbookDetail } from '../common/catalog';

// ================================
// Types
// ================================

export interface PlanSubject {
  id: number;
  planBoardId: number;
  subjectId: number;
  subjectName: string;
  textbookId: number;
  textbookTitle: string;
  startChapterId: number;
  endChapterId: number;
  customRangeText: string | null;
}

// ================================
// Functions
// ================================

/**
 * 플랜보드에 등록된 과목 범위 목록 조회 API 함수
 * @param boardId 플랜보드 ID
 * @returns 과목 범위 배열
 */
export const getPlanSubjects = async (boardId: number): Promise<PlanSubject[]> => {
  const response = await api.get(`/plan-boards/${boardId}/subjects`);
  return response.data;
};

/**
 * 플랜보드에 쓰인 교과서를 표지·출판사와 함께 조회. 같은 교과서는 한 번만 담고, 불러오지 못한 교과서는 빠짐
 * @param boardId 플랜보드 ID
 * @returns 교과서 상세 배열
 */
export const getPlanBoardTextbooks = async (boardId: number): Promise<TextbookDetail[]> => {
  const subjects = await getPlanSubjects(boardId);
  const textbookIds = [...new Set(subjects.map((subject) => subject.textbookId))];
  const details = await Promise.all(textbookIds.map((id) => getTextbookDetail(id).catch(() => null)));
  return details.filter((detail): detail is TextbookDetail => detail !== null);
};
