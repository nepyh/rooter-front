import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlanBoards } from "@/api/common/planBoard";
import { invalidateTaskQueries, queryClient, queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { toLocalDateString } from "@/utils/common/date";
import { splitPlanBoards } from "@/utils/home/planBoard";
import { getGenerationSignature, hasGeneratingBoard, PLAN_GENERATION_POLL_MS } from "@/utils/home/planGeneration";

// ================================
// Hooks
// ================================

/**
 * usePlanBoards — 플랜 목록을 진행 중·완료로 나누고 대표 플랜을 찾아 줌. 홈(D-Day·플랜 없음 안내), 플랜 목록, 플랜 수정 화면이 함께 씀
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * AI 계획의 남은 기간을 서버가 만드는 중인 플랜이 있으면 PLAN_GENERATION_POLL_MS 마다 다시 불러오고,
 * 새로 만들어진 날이 생기면 할 일·캘린더를 다시 불러와 바로 보이게 합니다 (rooter-back#405)
 * @returns boards(전체), inProgress, completed, representative(대표 플랜, 없으면 null), isPending, isError
 */
export function usePlanBoards() {
  const boardsQuery = useQuery({
    queryKey: queryKeys.boards.list,
    queryFn: getPlanBoards,
    refetchInterval: (query) => (hasGeneratingBoard(query.state.data ?? []) ? PLAN_GENERATION_POLL_MS : false),
  });

  useRefetchOnFocus([queryKeys.boards.list]);

  const boards = boardsQuery.isError ? [] : boardsQuery.data ?? [];

  const generationSignature = getGenerationSignature(boards);
  const prevSignatureRef = useRef(generationSignature);
  useEffect(() => {
    if (prevSignatureRef.current === generationSignature) return;
    prevSignatureRef.current = generationSignature;
    invalidateTaskQueries();
    queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  }, [generationSignature]);
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
