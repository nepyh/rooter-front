import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store";
import { getContributionLevels } from "@/api/more/More";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { toLocalDateString } from "@/utils/common/date";
import { startOfWeek } from "@/utils/more/contribution";

// ================================
// Constants
// ================================

const EMPTY_LEVELS: Record<string, number> = {};

// ================================
// Hooks
// ================================

/**
 * useContributionLevels — 오늘이 든 주까지 weekCount 주 동안의 날짜별 잔디 색 단계 조회
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * @param today 오늘 날짜
 * @param weekCount 조회할 주 수
 * @returns 날짜(yyyy-MM-dd) → 색 단계(0~5)
 */
export function useContributionLevels(today: Date, weekCount: number) {
  const userId = useUserStore((state) => state.userId);

  const start = startOfWeek(today);
  start.setDate(start.getDate() - (weekCount - 1) * 7);
  const startKey = toLocalDateString(start);
  const endKey = toLocalDateString(today);
  const queryKey = queryKeys.contribution.range(userId ?? 0, startKey, endKey);

  const levelsQuery = useQuery({
    queryKey,
    queryFn: () => getContributionLevels(userId as number, startKey, endKey),
    enabled: userId !== null,
  });

  useRefetchOnFocus([queryKey]);

  return (levelsQuery.isError ? null : levelsQuery.data) ?? EMPTY_LEVELS;
}
