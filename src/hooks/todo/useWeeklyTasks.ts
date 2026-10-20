import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getWeeklyTasks } from "@/api/common/planBoard";
import type { WeeklyPlan } from "@/api/common/planBoard";

// ================================
// Constants
// ================================

const EMPTY_WEEK: WeeklyPlan = { weekStart: "", weekEnd: "", days: [] };

// ================================
// Hooks
// ================================

/**
 * useWeeklyTasks — 고른 날짜의 할 일 조회. 화면에 다시 들어올 때마다 다시 불러옴
 * 처음 불러올 때만 loaded 가 false 이고, 다시 불러올 때는 이전 목록을 둔 채 갱신합니다.
 * @param selectedKey 고른 날짜 (yyyy-MM-dd)
 * @returns loaded, tasks(고른 날짜의 할 일)
 */
export function useWeeklyTasks(selectedKey: string) {
  const [week, setWeek] = useState<WeeklyPlan>(EMPTY_WEEK);
  const [loaded, setLoaded] = useState(false);

  const loadWeek = useCallback(() => {
    getWeeklyTasks(selectedKey)
      .then(setWeek)
      .catch(() => setWeek(EMPTY_WEEK))
      .finally(() => setLoaded(true));
  }, [selectedKey]);

  useFocusEffect(loadWeek);

  return {
    loaded,
    tasks: week.days.find((day) => day.planDate === selectedKey)?.tasks ?? [],
  };
}
