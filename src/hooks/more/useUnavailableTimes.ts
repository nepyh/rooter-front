import { useEffect, useState } from "react";
import { useUserStore } from "@/store";
import { addUnavailableTime, getUnavailableTimes } from "@/api/user";
import type { UnavailableTime } from "@/api/user";
import { normalizeClock } from "@/utils/more/time";

// ================================
// Hooks
// ================================

/**
 * useUnavailableTimes — 내 불가능 시간 목록 조회와 추가
 * @returns items, error(보여줄 에러 문구), submitting, add(추가에 성공했는지 돌려줌)
 */
export function useUnavailableTimes() {
  const userId = useUserStore((state) => state.userId);
  const [items, setItems] = useState<UnavailableTime[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId === null) return;
    getUnavailableTimes(userId).then(setItems).catch(() => setItems([]));
  }, [userId]);

  const add = async (dayOfWeek: number, startText: string, endText: string) => {
    if (userId === null || submitting) return false;

    const startTime = normalizeClock(startText);
    const endTime = normalizeClock(endText);
    if (!startTime || !endTime) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return false;
    }

    setError("");
    setSubmitting(true);
    try {
      const created = await addUnavailableTime(userId, { dayOfWeek, startTime, endTime });
      setItems((prev) => [...prev, created]);
      return true;
    } catch {
      setError("추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { items, error, submitting, add };
}
