import api from './axios';

// ================================
// Types
// ================================

export interface StudyStyleAnswer {
  questionNumber: number; // 1~7
  answerOption: number; // 1~3, 4=모르겠어요
}

export interface StudyStyle {
  answers: StudyStyleAnswer[];
}

/**
 * 공부스타일 설문 제출 API 함수
 * @param answers 제출할 문항별 답변 (제출한 문항만 덮어씀)
 * @returns 현재까지 저장된 전체 답변
 */
export const submitStudyStyle = async (answers: StudyStyleAnswer[]): Promise<StudyStyle> => {
  const response = await api.post('/study-style', { answers });
  return response.data;
};

/**
 * 공부스타일 설문 응답 조회 API 함수
 * @returns 저장된 답변 (미응답 문항은 생략됨)
 */
export const getStudyStyle = async (): Promise<StudyStyle> => {
  const response = await api.get('/study-style');
  return response.data;
};
