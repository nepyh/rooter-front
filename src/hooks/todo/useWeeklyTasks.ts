import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getWeeklyTasks } from "@/api/common/planBoard";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { getWeekStartKey } from "@/utils/todo/date";

// ================================
// Hooks
// ================================

/**
 * useWeeklyTasks — 고른 날짜의 할 일 조회. 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옴
 * 주 단위(월요일)로 캐시해서, 같은 주 안에서 날짜를 바꾸면 요청 없이 캐시에서 꺼냅니다.
 * 처음 불러올 때만 loaded 가 false 이고, 다른 주로 넘어갈 때는 캐시된 목록을 둔 채 갱신합니다.
 * @param selectedKey 고른 날짜 (yyyy-MM-dd)
 * @returns loaded, tasks(고른 날짜의 할 일), isError(불러오기 실패),
 *   isPlaceholder(다른 주로 넘어가 새 주를 불러오는 중이라 tasks 가 아직 비어 있을 수 있음)
 */
export function useWeeklyTasks(selectedKey: string) {
  const weekStartKey = getWeekStartKey(selectedKey);
  const weekQuery = useQuery({
    queryKey: queryKeys.tasks.weekly(weekStartKey),
    queryFn: () => getWeeklyTasks(weekStartKey),
    placeholderData: keepPreviousData,
  });

  useRefetchOnFocus([queryKeys.tasks.weekly(weekStartKey)]);

  const week = weekQuery.isError ? null : weekQuery.data;

  return {
    loaded: !weekQuery.isPending,
    isError: weekQuery.isError,
    isPlaceholder: weekQuery.isPlaceholderData,
    tasks: week?.days.find((day) => day.planDate === selectedKey)?.tasks ?? [],
  };
}
