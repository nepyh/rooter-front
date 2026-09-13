import api from './axios';

// ================================
// Types
// ================================

export interface LevelTestQuestion {
  id: number;
  subject: string;
  questionText: string;
  choices: string[];
}

export interface LevelTest {
  attemptId: number;
  referenceGradeLabel: string;
  questions: LevelTestQuestion[];
}

export interface LevelTestAnswer {
  questionId: number;
  selectedIndex: number;
}

export interface LevelTestSubjectScore {
  subject: string;
  correctCount: number;
  totalCount: number;
  tier: string;
}

export interface LevelTestResult {
  correctCount: number;
  totalCount: number;
  tier: string;
  subjectScores: LevelTestSubjectScore[];
}

/**
 * 실력 테스트 생성 API 함수
 * @param grade 학년 (1~3)
 * @returns 생성된 테스트 문제
 */
export const generateLevelTest = async (grade: number): Promise<LevelTest> => {
  const response = await api.post('/level-test/generate', { grade });
  return response.data;
};

/**
 * 실력 테스트 제출 및 채점 API 함수
 * @param attemptId 테스트 시도 ID
 * @param answers 문항별 선택한 답안
 * @returns 채점 결과
 */
export const submitLevelTest = async (attemptId: number, answers: LevelTestAnswer[]): Promise<LevelTestResult> => {
  const response = await api.post(`/level-test/${attemptId}/submit`, { answers });
  return response.data;
};
