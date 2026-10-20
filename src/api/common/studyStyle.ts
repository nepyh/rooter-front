import api from '../axios';

// ================================
// Types
// ================================

/**
 * 공부스타일 설문 답변 하나
 * @param questionNumber 문항 번호 (1~7)
 * @param answerOption 고른 보기 (1~3, 4 = 모르겠어요)
 */
export interface StudyStyleAnswer {
  questionNumber: number;
  answerOption: number;
}

export interface StudyStyle {
  answers: StudyStyleAnswer[];
}

// ================================
// Functions
// ================================

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

/**
 * 설문 답변 문자열을 공부 스타일로 저장. 실패해도 다음 화면으로 넘어갈 수 있도록 에러를 던지지 않음
 * @param answers 문항별로 고른 보기 번호(0부터)를 쉼표로 이은 값 (예: "0,2,1")
 */
export const saveStudyStyleAnswers = async (answers: string) => {
  const studyStyleAnswers = answers.split(",").map((selectedIndex, i) => ({
    questionNumber: i + 1,
    answerOption: Number(selectedIndex) + 1,
  }));
  await submitStudyStyle(studyStyleAnswers).catch(() => {});
};
