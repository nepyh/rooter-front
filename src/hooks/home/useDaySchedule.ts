import { queryOptions, useQuery } from "@tanstack/react-query";
import { getBusyTimes } from "@/api/home/Home/busyTime";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { buildBusyBlocks } from "@/utils/home/timeline";

// ================================
// Query Options
// ================================

/**
 * 그날 바쁜 시간 쿼리 설정. useDaySchedule 와 옆 페이지(useNeighborDay)가 함께 씀
 * @param date 조회할 날짜 (YYYY-MM-DD)
 */
export const busyTimesQueryOptions = (date: string) =>
  queryOptions({
    queryKey: queryKeys.busyTimes.range(date, date),
    queryFn: () => getBusyTimes(date, date),
  });

// ================================
// Hooks
// ================================

/**
 * useDaySchedule — 그날의 수면·학교·불가능 시간 조회
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @returns busyBlocks(타임라인에 그릴 바쁜 시간)
 */
export function useDaySchedule(selectedKey: string) {
  const busyQuery = useQuery(busyTimesQueryOptions(selectedKey));

  useRefetchOnFocus([queryKeys.busyTimes.range(selectedKey, selectedKey)]);

  const busyDay = busyQuery.isError ? null : busyQuery.data?.days[0] ?? null;

  return {
    busyBlocks: buildBusyBlocks(busyDay),
  };
}
