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
  name: string;
}

export interface Chapter {
  id: number;
  name: string;
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
 * 교과서별 단원 목록 조회 API 함수
 * @param textbookId 교과서 ID
 * @returns 단원 배열
 */
export const getChaptersByTextbook = async (textbookId: number): Promise<Chapter[]> => {
  const response = await api.get(`/catalog/textbooks/${textbookId}/chapters`);
  return response.data;
};
