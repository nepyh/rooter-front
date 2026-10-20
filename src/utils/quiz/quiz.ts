import type { Category } from "@/constants/category";
import type { QuizQuestionResult, TaskQuizAnswerResult, TaskQuizResult } from "@/api/quiz/QuizPage";

// ================================
// Types
// ================================

export type OptionState = "default" | "selected" | "correct" | "wrong";

// ================================
// Constants
// ================================

/**
 * 퀴즈 응답에 과목 정보가 없을 때 쓰는, 홈에서 넘겨준 카테고리별 과목 이름
 */
export const SUBJECT_LABELS: Partial<Record<Category, string>> = {
  "math": "수학",
  "english": "영어",
  "science": "과학",
  "social": "사회",
};

const CORRECT_MESSAGES = ["정답이에요!", "훌륭한걸요?", "좋아요!!", "완벽해요!", "잘했어요!", "정확해요!", "역시 대단해요!", "이대로만 가요!"];

// ================================
// Functions
// ================================

/**
 * 맞혔을 때 보여줄 칭찬 문구 하나를 무작위로 고름
 */
export const pickCorrectMessage = () => CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];

/**
 * 점수 화면 아래에 보여줄 결과 안내 한 줄
 * @param result 채점 결과
 * @returns 안내 문구, 보여줄 게 없으면 null
 */
export const getResultNotice = (result: TaskQuizResult) => {
  if (result.passed) return "통과! 할 일이 완료 처리됐어요.";
  if (result.taskInvalidated) return "세 번 모두 통과하지 못해 이번 할 일은 미완료로 확정됐어요.";
  if (result.retryScheduled) return "10분 뒤 새 문제로 다시 도전할 수 있어요. 남은 일정은 15분씩 미뤄졌어요.";
  return null;
};

/**
 * 보기 하나의 표시 상태. 풀이 보기·채점 직후엔 정답·오답을, 풀기 전엔 고른 보기를 표시
 * @param choiceId 보기 ID
 * @param selectedChoiceId 지금 문제에서 고른 보기 ID
 * @param grade 이 문제를 바로 채점한 결과
 * @param review 전체 제출 뒤 풀이 보기의 이 문제 결과
 */
export const getOptionState = (
  choiceId: number,
  selectedChoiceId: number | undefined,
  grade: TaskQuizAnswerResult | undefined,
  review: QuizQuestionResult | undefined,
): OptionState => {
  if (review) {
    if (choiceId === review.correctChoiceId) return "correct";
    if (choiceId === review.selectedChoiceId) return "wrong";
    return "default";
  }
  if (grade) {
    if (choiceId === grade.correctChoiceId) return "correct";
    if (choiceId === selectedChoiceId) return "wrong";
    return "default";
  }
  return selectedChoiceId === choiceId ? "selected" : "default";
};
