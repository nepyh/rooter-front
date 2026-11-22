import { useState } from "react";
import {
  addUnavailableTime,
  deleteUnavailableTime,
  getSleepTime,
  getUnavailableTimes,
  updateSleepTime,
} from "@/api/common/user";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useUserStore } from "@/store";
import { describeBusyDrop, getDropClock, resolveMeal, toDayOfWeekNumber } from "@/utils/home/busyEdit";
import type { BusyBlock, BusyDrop } from "@/utils/home/timeline";

// ================================
// Hooks
// ================================

/**
 * useBusyEdit — 홈 시간표에서 수면·식사 블록을 끌어 놓았을 때 확인과 저장
 * 놓으면 바꿀지 묻는 동안 새 위치를 미리 보여주고, 바꾸면 수면 시간 또는 그 요일 식사 시간을 저장합니다.
 * 저장 뒤 바쁜 시간을 다시 불러올 때까지 미리 보기를 유지해 블록이 원래 자리로 튀지 않게 합니다.
 * @param date 보고 있는 날짜 (식사는 이 날의 요일에 저장)
 * @returns drop, confirmMessage, saving, error, applyDrop(바쁜 시간에 미리 보기 반영), requestDrop, cancel, confirm, clearError
 */
export function useBusyEdit(date: Date) {
  const userId = useUserStore((state) => state.userId);
  const [drop, setDrop] = useState<BusyDrop | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const requestDrop = (block: BusyBlock, start: number, duration: number) => {
    if (start === block.start && duration === block.duration) return;
    setDrop({ block, start, duration });
    setConfirming(true);
  };

  const cancel = () => {
    setDrop(null);
    setConfirming(false);
  };

  const saveSleep = async (target: BusyDrop, id: number) => {
    const current = await queryClient.fetchQuery({ queryKey: queryKeys.users.sleepTime(id), queryFn: () => getSleepTime(id) });
    const { start, end } = getDropClock(target);
    const isBedTime = target.block.edit?.edge === "top";
    const saved = await updateSleepTime(id, {
      sleepTime: isBedTime ? start : current.sleepTime,
      wakeTime: isBedTime ? current.wakeTime : end,
    });
    queryClient.setQueryData(queryKeys.users.sleepTime(id), saved);
  };

  // 새 식사를 먼저 저장하고 예전 식사를 지움. 지우기에 실패해도 바뀐 시간은 남도록 순서를 둠
  const saveMeal = async (target: BusyDrop, id: number) => {
    const dayOfWeek = toDayOfWeekNumber(date);
    const { kind, existing } = resolveMeal(target, await getUnavailableTimes(id), dayOfWeek);
    const { start, end } = getDropClock(target);
    await addUnavailableTime(id, { dayOfWeek, startTime: start, endTime: end, kind, label: existing?.label ?? null });
    if (existing) await deleteUnavailableTime(id, existing.id);
  };

  const confirm = async () => {
    if (!drop || userId === null || saving) return;
    setConfirming(false);
    setSaving(true);
    try {
      if (drop.block.edit?.target === "sleep") await saveSleep(drop, userId);
      else await saveMeal(drop, userId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.busyTimes.all });
    } catch {
      setError("시간을 바꾸지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setDrop(null);
      setSaving(false);
    }
  };

  /**
   * 바쁜 시간 블록에 끌어 놓은 새 위치를 반영해 돌려줌
   * @param blocks 서버에서 받은 바쁜 시간 블록
   */
  const applyDrop = (blocks: BusyBlock[]) =>
    drop ? blocks.map((block) => (block.key === drop.block.key ? { ...block, start: drop.start, duration: drop.duration } : block)) : blocks;

  return {
    drop,
    confirmMessage: drop && confirming ? describeBusyDrop(drop, date) : null,
    saving,
    error,
    applyDrop,
    requestDrop,
    cancel,
    confirm,
    clearError: () => setError(""),
  };
}
