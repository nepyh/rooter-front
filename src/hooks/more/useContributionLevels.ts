import { useEffect, useState } from "react";
import { useUserStore } from "@/store";
import { getContributionLevels } from "@/api/more/More";
import { toLocalDateString } from "@/utils/date";
import { startOfWeek } from "@/utils/more/contribution";

// ================================
// Hooks
// ================================

/**
 * useContributionLevels — 오늘이 든 주까지 weekCount 주 동안의 날짜별 잔디 색 단계 조회
 * @param today 오늘 날짜
 * @param weekCount 조회할 주 수
 * @returns 날짜(yyyy-MM-dd) → 색 단계(0~5)
 */
export function useContributionLevels(today: Date, weekCount: number) {
  const userId = useUserStore((state) => state.userId);
  const [levels, setLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userId === null) return;
    const start = startOfWeek(today);
    start.setDate(start.getDate() - (weekCount - 1) * 7);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    getContributionLevels(userId, toLocalDateString(start), toLocalDateString(end))
      .then(setLevels)
      .catch(() => setLevels({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return levels;
}
