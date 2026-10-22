import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dailyPlansQueryOptions } from "@/hooks/home/usePlans";
import { busyTimesQueryOptions } from "@/hooks/home/useDaySchedule";
import { toLocalDateString } from "@/utils/common/date";

// ================================
// Hooks
// ================================

/**
 * usePrefetchNeighborDays — 홈에서 보고 있는 날의 어제·내일 일정과 바쁜 시간을 미리 캐시에 받아둠
 * 좌우로 넘겼을 때 빈 타임라인 없이 바로 그려지게 합니다. 이미 신선한 캐시가 있으면 요청하지 않습니다.
 * @param selectedDate 보고 있는 날짜
 */
export function usePrefetchNeighborDays(selectedDate: Date) {
  const queryClient = useQueryClient();
  const prevKey = toLocalDateString(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
  const nextKey = toLocalDateString(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));

  useEffect(() => {
    [prevKey, nextKey].forEach((date) => {
      queryClient.prefetchQuery(dailyPlansQueryOptions(date));
      queryClient.prefetchQuery(busyTimesQueryOptions(date));
    });
  }, [queryClient, prevKey, nextKey]);
}
