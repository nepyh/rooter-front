import { queryOptions, useQuery } from "@tanstack/react-query";
import { getBusyTimes } from "@/api/home/Home/busyTime";
import { getNextExamDate } from "@/api/home/Home";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { buildBusyBlocks, getDDay } from "@/utils/home/timeline";

// ================================
// Query Options
// ================================

/**
 * 그날 바쁜 시간 쿼리 설정. useDaySchedule 와 옆 날짜 미리 받기(usePrefetchNeighborDays)가 함께 씀
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
 * useDaySchedule — 그날의 수면·학교·불가능 시간과 다가오는 시험 D-Day 조회
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @param now 현재 시각, D-Day 계산에 씀
 * @returns busyBlocks(타임라인에 그릴 바쁜 시간), examDDay(가장 가까운 시험까지 남은 일수, 없으면 null)
 */
export function useDaySchedule(selectedKey: string, now: Date) {
  const busyQuery = useQuery(busyTimesQueryOptions(selectedKey));
  const nextExamQuery = useQuery({
    queryKey: queryKeys.boards.nextExamDate,
    queryFn: getNextExamDate,
  });

  useRefetchOnFocus([queryKeys.busyTimes.range(selectedKey, selectedKey), queryKeys.boards.nextExamDate]);

  const busyDay = busyQuery.isError ? null : busyQuery.data?.days[0] ?? null;
  const nextExamDate = nextExamQuery.isError ? null : nextExamQuery.data ?? null;

  return {
    busyBlocks: buildBusyBlocks(busyDay),
    examDDay: nextExamDate ? getDDay(nextExamDate, now) : null,
  };
}
