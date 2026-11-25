import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import type { PlanBoard } from "@/api/common/planBoard";
import { retryPlanGeneration } from "@/api/home/common/planGeneration";
import { queryClient, queryKeys } from "@/api/queryClient";
import { findGenerationNotice, type PlanGenerationNotice } from "@/utils/home/planGeneration";

// ================================
// Constants
// ================================

const NOTICE_MESSAGES: Record<PlanGenerationNotice["kind"], string> = {
  "generating": "이 날 계획은 루티가 지금 만들고 있어요. 다 만들면 자동으로 나타나요!",
  "failed": "이 날부터의 계획을 만들지 못했어요. 다시 만들어볼까요?",
};

const NOTICE_ACTION_LABELS: Record<PlanGenerationNotice["kind"], string> = {
  "generating": "플랜 목록 보기",
  "failed": "남은 계획 다시 만들기",
};

const RETRY_FAILED_MESSAGE = "다시 만들기를 시작하지 못했어요. 잠시 후 다시 시도해주세요.";

// ================================
// Hooks
// ================================

/**
 * usePlanGenerationNotice — 홈에서 고른 날짜의 계획이 아직 만들어지지 않았을 때 보여줄 안내 (rooter-back#405)
 * 만드는 중이면 기다리라고 안내하고, 실패했으면 남은 계획 다시 만들기를 제안함. 닫으면 같은 플랜·상태에서는 다시 띄우지 않음
 * @param boards 플랜보드 목록
 * @param dateKey 홈에서 고른 날짜 (YYYY-MM-DD)
 * @returns visible, message, actionLabel, onAction, close
 */
export function usePlanGenerationNotice(boards: PlanBoard[], dateKey: string) {
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const notice = findGenerationNotice(boards, dateKey);
  const noticeKey = notice ? `${notice.board.id}:${notice.kind}` : null;

  const retry = async (board: PlanBoard) => {
    if (retrying) return;
    setRetrying(true);
    try {
      await retryPlanGeneration(board.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    } catch {
      Alert.alert("다시 만들기 실패", RETRY_FAILED_MESSAGE);
    } finally {
      setRetrying(false);
    }
  };

  const onAction = () => {
    if (!notice) return;
    if (notice.kind === "failed") retry(notice.board);
    else router.push("/Home/PlanListPage");
  };

  return {
    visible: notice !== null && noticeKey !== closedKey,
    message: notice ? NOTICE_MESSAGES[notice.kind] : "",
    actionLabel: notice ? NOTICE_ACTION_LABELS[notice.kind] : "",
    onAction,
    close: () => setClosedKey(noticeKey),
  };
}
