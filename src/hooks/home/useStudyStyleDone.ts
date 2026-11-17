import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store";
import { getStudyStyle } from "@/api/common/studyStyle";
import { queryKeys } from "@/api/queryClient";
import { SURVEY_QUESTIONS } from "@/api/learningSurvey/StudySurveyQuestion";

// ================================
// Hooks
// ================================

/**
 * useStudyStyleDone — 공부 스타일 설문의 모든 문항에 답했는지
 * 서버는 답한 문항만 돌려주므로, 1번부터 마지막 문항까지 답이 다 있어야 완료로 봄
 * @returns 완료면 true, 아니면 false, 불러오는 중이거나 실패했으면 undefined
 */
export function useStudyStyleDone() {
  const userId = useUserStore((state) => state.userId);

  const studyStyleQuery = useQuery({
    queryKey: queryKeys.users.studyStyle(userId ?? 0),
    queryFn: getStudyStyle,
    enabled: userId !== null,
  });

  if (!studyStyleQuery.data) return undefined;
  const answered = new Set(
    studyStyleQuery.data.answers.map((answer) => answer.questionNumber),
  );
  return SURVEY_QUESTIONS.every((_, index) => answered.has(index + 1));
}
