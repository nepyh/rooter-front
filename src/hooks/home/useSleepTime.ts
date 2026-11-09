import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store";
import { getSleepTime } from "@/api/common/user";
import { queryKeys } from "@/api/queryClient";

// ================================
// Hooks
// ================================

/**
 * useSleepTime — 저장된 수면 시간 조회
 * 캐시에 담아 두어, 수면 시간 화면에 다시 들어와도 다시 불러오지 않고 바로 보여줍니다.
 * @returns 저장된 수면 시간 (불러오기 전이거나 저장한 적 없으면 null)
 */
export function useSleepTime() {
  const userId = useUserStore((state) => state.userId);

  const sleepTimeQuery = useQuery({
    queryKey: queryKeys.users.sleepTime(userId ?? 0),
    queryFn: () => getSleepTime(userId as number),
    enabled: userId !== null,
  });

  const sleepTime = sleepTimeQuery.data;
  return sleepTime && !sleepTime.isDefault ? sleepTime : null;
}
