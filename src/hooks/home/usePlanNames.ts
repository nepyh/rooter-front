import { useQuery } from "@tanstack/react-query";
import { getPlanBoards } from "@/api/common/planBoard";
import { queryKeys } from "@/api/queryClient";
import { getPlanNames } from "@/utils/home/planBoard";

// ================================
// Hooks
// ================================

/**
 * usePlanNames — 일정 블록에 보여줄 플랜 이름 목록
 * usePlanBoards 와 같은 플랜 목록 캐시를 select 로 골라 써서 요청이 더 나가지 않고, 목록이 바뀔 때만 다시 계산합니다.
 * @returns 플랜보드 ID → 플랜 이름 (플랜이 하나뿐이거나 목록을 못 불러왔으면 빈 목록)
 */
export function usePlanNames() {
  const namesQuery = useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: getPlanBoards,
    select: getPlanNames,
  });

  return namesQuery.isError ? {} : namesQuery.data ?? {};
}
