import { useQuery } from "@tanstack/react-query";
import { dailyPlansQueryOptions } from "@/hooks/home/usePlans";
import { busyTimesQueryOptions } from "@/hooks/home/useDaySchedule";
import { toLocalDateString } from "@/utils/common/date";
import { buildBusyBlocks, markPastPlansFailed } from "@/utils/home/timeline";

// ================================
// Hooks
// ================================

/**
 * useNeighborDay — 홈에서 좌우로 넘길 때 옆에 보이는 날의 일정과 바쁜 시간 조회
 * 옆 페이지가 그려져 있는 동안 캐시에 받아두므로, 넘기는 중에도 넘긴 뒤에도 빈 타임라인 없이 바로 보입니다.
 * @param date 옆 페이지 날짜
 * @param now 현재 시각, 끝난 시각이 지난 미완료 일정을 실패로 표시할 때 씀
 * @returns dateKey(YYYY-MM-DD), busyBlocks, plans(실패 반영)
 */
export function useNeighborDay(date: Date, now: Date) {
  const dateKey = toLocalDateString(date);
  const dailyQuery = useQuery(dailyPlansQueryOptions(dateKey));
  const busyQuery = useQuery(busyTimesQueryOptions(dateKey));

  const plans = dailyQuery.isError ? [] : dailyQuery.data?.plans ?? [];
  const busyDay = busyQuery.isError ? null : busyQuery.data?.days[0] ?? null;

  return {
    dateKey,
    busyBlocks: buildBusyBlocks(busyDay),
    plans: markPastPlansFailed(plans, date, now),
  };
}
