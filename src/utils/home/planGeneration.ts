import type { PlanBoard, PlanGenerationStatus } from "@/api/common/planBoard";

// ================================
// Types
// ================================

/**
 * 홈에서 보는 날짜의 계획이 아직 없는 이유 (rooter-back#405)
 * - generating: 서버가 그 날 계획을 만드는 중
 * - failed: 그 날까지 계획을 만들지 못함, 다시 만들기 필요
 */
export interface PlanGenerationNotice {
  kind: "generating" | "failed";
  board: PlanBoard;
}

// ================================
// Constants
// ================================

/** 계획을 만드는 중인 플랜이 있을 때 플랜 목록을 다시 불러오는 간격 */
export const PLAN_GENERATION_POLL_MS = 5_000;

const NOTICE_KINDS: Record<PlanGenerationStatus, PlanGenerationNotice["kind"] | null> = {
  "COMPLETED": null,
  "GENERATING": "generating",
  "FAILED": "failed",
};

// ================================
// Functions
// ================================

/**
 * 플랜의 AI 계획 생성 상태. 필드가 없는 옛 응답·캐시는 다 만든 것으로 봄
 * @param board 플랜보드
 */
export const getGenerationStatus = (board: PlanBoard): PlanGenerationStatus => board.generationStatus ?? "COMPLETED";

/**
 * 남은 기간을 만드는 중인 플랜이 있는지. 있으면 플랜 목록을 주기적으로 다시 불러와 진행 상황을 확인함
 * @param boards 플랜보드 목록
 */
export const hasGeneratingBoard = (boards: PlanBoard[]) => boards.some((board) => getGenerationStatus(board) === "GENERATING");

/**
 * 생성 진행 상황 요약 문자열. 바뀌면 새로 만들어진 날의 할 일·캘린더를 다시 불러옴
 * @param boards 플랜보드 목록
 */
export const getGenerationSignature = (boards: PlanBoard[]) =>
  boards
    .filter((board) => board.generationStatus !== undefined)
    .map((board) => `${board.id}:${getGenerationStatus(board)}:${board.generatedUntil ?? ""}`)
    .join("|");

/**
 * 선택한 날짜가 어떤 플랜 기간 안인데 아직 계획이 만들어지지 않은 날이면 그 이유. 그런 플랜이 없으면 null
 * 여러 플랜이 겹치면 대표 플랜을 먼저 봄
 * @param boards 플랜보드 목록
 * @param dateKey 선택한 날짜 (YYYY-MM-DD)
 */
export const findGenerationNotice = (boards: PlanBoard[], dateKey: string): PlanGenerationNotice | null => {
  const candidates = [...boards].sort((a, b) => Number(b.isRepresentative) - Number(a.isRepresentative));
  for (const board of candidates) {
    const kind = NOTICE_KINDS[getGenerationStatus(board)];
    if (!kind || board.isArchived) continue;
    if (dateKey < board.startDate || dateKey > board.endDate) continue;
    if (board.generatedUntil && dateKey <= board.generatedUntil) continue;
    return { kind, board };
  }
  return null;
};
