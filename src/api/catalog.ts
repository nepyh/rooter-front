import api from './axios';

// ================================
// Types
// ================================

export interface Subject {
  id: number;
  name: string;
}

export interface Textbook {
  id: number;
  subjectId: number;
  publisherId: number | null;
  title: string;
  aiStatus: string;
}

export interface ChapterTree {
  id: number;
  chapterName: string;
  chapterOrder: number;
  children: ChapterTree[];
}

export interface TextbookDetail {
  id: number;
  subjectId: number;
  subjectName: string;
  publisherId: number | null;
  title: string;
  aiStatus: string;
  chapters: ChapterTree[];
}

/**
 * 과목 목록 조회 API 함수
 * @returns 과목 배열
 */
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get('/catalog/subjects');
  return response.data;
};

/**
 * 과목별 교과서 목록 조회 API 함수
 * @param subjectId 과목 ID
 * @returns 교과서 배열
 */
export const getTextbooksBySubject = async (subjectId: number): Promise<Textbook[]> => {
  const response = await api.get(`/catalog/subjects/${subjectId}/textbooks`);
  return response.data;
};

/**
 * 교과서 상세 조회 API 함수 (단원 목차 트리 포함)
 * @param textbookId 교과서 ID
 * @returns 교과서 상세 정보
 */
export const getTextbookDetail = async (textbookId: number): Promise<TextbookDetail> => {
  const response = await api.get(`/catalog/textbooks/${textbookId}/detail`);
  return response.data;
};
