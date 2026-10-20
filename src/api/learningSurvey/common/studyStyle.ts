import { submitStudyStyle } from '../../studyStyle';

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
