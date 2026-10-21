import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getWeeklyTasks } from "@/api/common/planBoard";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";

// ================================
// Hooks
// ================================

/**
 * useWeeklyTasks — 고른 날짜의 할 일 조회. 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옴
 * 처음 불러올 때만 loaded 가 false 이고, 다시 불러올 때는 캐시된 목록을 둔 채 갱신합니다.
 * @param selectedKey 고른 날짜 (yyyy-MM-dd)
 * @returns loaded, tasks(고른 날짜의 할 일)
 */
export function useWeeklyTasks(selectedKey: string) {
  const weekQuery = useQuery({
    queryKey: queryKeys.tasks.weekly(selectedKey),
    queryFn: () => getWeeklyTasks(selectedKey),
    placeholderData: keepPreviousData,
  });

  useRefetchOnFocus([queryKeys.tasks.weekly(selectedKey)]);

  const week = weekQuery.isError ? null : weekQuery.data;

  return {
    loaded: !weekQuery.isPending,
    tasks: week?.days.find((day) => day.planDate === selectedKey)?.tasks ?? [],
  };
}
