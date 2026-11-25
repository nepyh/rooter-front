import type { PlanBoard, PlanGenerationStatus } from "@/api/common/planBoard";
import type { CalendarItem, CalendarItemsByDate } from "@/api/calendar/Calendar";

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

/** 캘린더에서 아직 안 만든 날에 넣는 표시 */
const PENDING_CALENDAR_ITEMS: Record<PlanGenerationNotice["kind"], Omit<CalendarItem, "kind">> = {
  "generating": {
    label: "계획 만드는 중",
    memo: "이 날 계획은 루티가 지금 만들고 있어요. 다 만들면 홈과 할 일에 자동으로 나타나요.",
    category: "neutral",
  },
  "failed": {
    label: "계획 만들기 실패",
    memo: "이 날부터의 계획을 만들지 못했어요. 홈에서 이 날짜로 가면 남은 계획을 다시 만들 수 있어요.",
    category: "neutral",
  },
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

/**
 * 플랜의 남은 기간이 아직 만들어지지 않은 상태. 다 만들었거나 보관한 플랜이면 null
 * @param board 플랜보드
 */
export const getPendingGenerationKind = (board: PlanBoard): PlanGenerationNotice["kind"] | null =>
  board.isArchived ? null : NOTICE_KINDS[getGenerationStatus(board)];

/**
 * 아직 계획이 만들어지지 않은 날에 넣을 캘린더 표시를 날짜별로 만듦. 만드는 중·실패한 플랜의 generatedUntil 다음 날부터 기간 끝까지
 * 캘린더 칸은 시험·개인 일정만 보여줘서, 할 일이 아직 안 생긴 날을 빈 날과 구분하려고 씀
 * @param boards 플랜보드 목록
 * @param startKey 캘린더 첫 칸 날짜 (YYYY-MM-DD)
 * @param endKey 캘린더 마지막 칸 날짜 (YYYY-MM-DD)
 */
export const buildPendingGenerationItems = (boards: PlanBoard[], startKey: string, endKey: string): CalendarItemsByDate => {
  const map: CalendarItemsByDate = {};
  for (const board of boards) {
    const kind = getPendingGenerationKind(board);
    if (!kind) continue;
    const firstPending = board.generatedUntil ? nextDateKey(board.generatedUntil) : board.startDate;
    const from = [firstPending, board.startDate, startKey].reduce((a, b) => (a > b ? a : b));
    const to = board.endDate < endKey ? board.endDate : endKey;
    for (let key = from; key <= to; key = nextDateKey(key)) {
      const items = map[key] ?? [];
      // 같은 날 여러 플랜이 만드는 중이어도 표시는 하나만
      if (!items.some((item) => item.kind === "generation")) items.push({ kind: "generation", ...PENDING_CALENDAR_ITEMS[kind] });
      map[key] = items;
    }
  }
  return map;
};

/**
 * 날짜별 캘린더 일정 두 묶음을 합침. 같은 날이면 first 의 일정을 먼저 둠
 * @param first 먼저 보여줄 일정
 * @param second 뒤에 붙일 일정
 */
export const mergeItemsByDate = (first: CalendarItemsByDate, second: CalendarItemsByDate): CalendarItemsByDate => {
  const merged: CalendarItemsByDate = { ...first };
  for (const [key, items] of Object.entries(second)) merged[key] = [...(merged[key] ?? []), ...items];
  return merged;
};

/**
 * 다음 날 (YYYY-MM-DD). 테스트(node --test)에서도 바로 불러올 수 있게 경로 별칭 없이 UTC 로 계산
 * @param key 날짜 (YYYY-MM-DD)
 */
const nextDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};
