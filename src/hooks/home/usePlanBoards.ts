import { useQuery } from "@tanstack/react-query";
import { getPlanBoards } from "@/api/common/planBoard";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { toLocalDateString } from "@/utils/common/date";
import { splitPlanBoards } from "@/utils/home/planBoard";

// ================================
// Hooks
// ================================

/**
 * usePlanBoards — 플랜 목록을 진행 중·완료로 나누고 대표 플랜을 찾아 줌. 홈(D-Day·플랜 없음 안내), 플랜 목록, 플랜 수정 화면이 함께 씀
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * @returns boards(전체), inProgress, completed, representative(대표 플랜, 없으면 null), isPending, isError
 */
export function usePlanBoards() {
  const boardsQuery = useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: getPlanBoards,
  });

  useRefetchOnFocus([queryKeys.boards.list]);

  const boards = boardsQuery.isError ? [] : boardsQuery.data ?? [];
  const { inProgress, completed } = splitPlanBoards(boards, toLocalDateString(new Date()));
  const representative = boards.find((board) => board.isRepresentative) ?? null;

  return {
    boards,
    inProgress,
    completed,
    representative,
    isPending: boardsQuery.isPending,
    isError: boardsQuery.isError,
  };
}
