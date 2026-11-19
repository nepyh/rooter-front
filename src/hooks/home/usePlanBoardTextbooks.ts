import { useQuery } from "@tanstack/react-query";
import { getPlanBoardTextbooks } from "@/api/home/PlanEditPage";
import { queryKeys } from "@/api/queryClient";

// ================================
// Hooks
// ================================

/**
 * usePlanBoardTextbooks — 플랜 수정 화면에 보여줄, 그 플랜에 쓰인 교과서 조회
 * @param boardId 플랜보드 ID
 * @returns textbooks, isPending
 */
export function usePlanBoardTextbooks(boardId: number) {
  const textbooksQuery = useQuery({
    queryKey: queryKeys.boards.textbooks(boardId),
    queryFn: () => getPlanBoardTextbooks(boardId),
  });

  return { textbooks: textbooksQuery.data ?? [], isPending: textbooksQuery.isPending };
}
