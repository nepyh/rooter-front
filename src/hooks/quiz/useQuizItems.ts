import { useQuery } from "@tanstack/react-query";
import { getQuizItems } from "@/api/quiz/Quiz";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { toLocalDateString } from "@/utils/common/date";
import { parseHHmm } from "@/utils/common/time";

// ================================
// Hooks
// ================================

/**
 * useQuizItems — 오늘 퀴즈를 진행 중·예정·완료로 나눠 조회. 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옴
 * 끝났는데 완료하지 못한 할일은 실패라 어느 목록에도 넣지 않습니다.
 * @param now 현재 시각
 * @returns loaded, current(지금 시간에 걸친 퀴즈), upcoming(시작 전), completed(완료), isEmpty
 */
export function useQuizItems(now: Date) {
  const today = toLocalDateString(now);
  const itemsQuery = useQuery({
    queryKey: queryKeys.tasks.quizItems(today),
    queryFn: () => getQuizItems(today),
  });

  useRefetchOnFocus([queryKeys.tasks.quizItems(today)]);

  const items = (itemsQuery.isError ? null : itemsQuery.data) ?? [];

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const remaining = items.filter((item) => !item.task.isCompleted);
  const current = remaining.filter((item) => parseHHmm(item.task.startTime) <= nowMin && nowMin < parseHHmm(item.task.endTime));
  const upcoming = remaining.filter((item) => parseHHmm(item.task.startTime) > nowMin);
  const completed = items.filter((item) => item.task.isCompleted);

  return { loaded: !itemsQuery.isPending, current, upcoming, completed, isEmpty: current.length + upcoming.length + completed.length === 0 };
}
