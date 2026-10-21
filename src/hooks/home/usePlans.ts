import { useState } from "react";
import { Alert } from "react-native";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Category } from "@/constants/category";
import { deletePlanTask, getDailyTasks, updatePlanTask } from "@/api/common/planBoard";
import { getBoardInfo, getEditErrorMessage } from "@/api/home/Home";
import { invalidatePlanQueries, invalidateTaskQueries, queryClient, queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { DAY_MIN } from "@/utils/common/time";
import {
  WINDOW_START_MIN,
  formatDuration,
  mapPlanTaskToPlan,
  toClockString,
  type Plan,
  type PlanStatus,
} from "@/utils/home/timeline";

// ================================
// Types
// ================================

interface DailyPlans {
  chatDailyPlanId: number | null;
  plans: Plan[];
}

// ================================
// Constants
// ================================

const EMPTY_MANUAL_IDS: number[] = [];
const EMPTY_CATEGORY_MAP: Record<number, Category> = {};

// ================================
// Query Options
// ================================

/**
 * 그날 할 일 쿼리 설정. usePlans 와 옆 날짜 미리 받기(usePrefetchNeighborDays)가 함께 씀
 * @param date 조회할 날짜 (YYYY-MM-DD)
 */
export const dailyPlansQueryOptions = (date: string) =>
  queryOptions({
    queryKey: queryKeys.tasks.daily(date),
    queryFn: async (): Promise<DailyPlans> => {
      const daily = await getDailyTasks(date);
      return { chatDailyPlanId: daily.tasks[0]?.dailyPlanId ?? null, plans: daily.tasks.map(mapPlanTaskToPlan) };
    },
  });

/**
 * 그날 할 일과 플랜보드 연결 정보 쿼리 설정. usePlans 와 usePrefetchNeighborDays 가 함께 씀
 * @param date 조회할 날짜 (YYYY-MM-DD)
 */
export const boardInfoQueryOptions = (date: string) =>
  queryOptions({
    queryKey: queryKeys.boards.info(date),
    queryFn: () => getBoardInfo(date),
  });

// ================================
// Hooks
// ================================

/**
 * usePlans — 홈 타임라인에 그릴 그날의 일정 조회·수정·삭제
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * 수정·삭제는 캐시를 먼저 고쳐 바로 반영하고, 서버 반영에 실패하면 그날 목록을 다시 불러옵니다.
 * @param selectedDate 보고 있는 날짜
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @param now 현재 시각, 끝난 시각이 지난 미완료 일정을 실패로 표시할 때 씀
 * @returns plans(원본), coloredPlans(실패·과목 색 반영), chatDailyPlanId, reload, isManualPlan, setPlanStatus, savePlanEdit, deletePlan
 */
export function usePlans(selectedDate: Date, selectedKey: string, now: Date) {
  const dailyKey = queryKeys.tasks.daily(selectedKey);

  const dailyQuery = useQuery(dailyPlansQueryOptions(selectedKey));
  const boardInfoQuery = useQuery(boardInfoQueryOptions(selectedKey));

  useRefetchOnFocus([dailyKey, queryKeys.boards.info(selectedKey)]);

  const [statusById, setStatusById] = useState<Map<string, PlanStatus>>(new Map());

  const daily = dailyQuery.isError ? null : dailyQuery.data;
  const plans = (daily?.plans ?? []).map((plan) => {
    const status = statusById.get(plan.id);
    return status ? { ...plan, status } : plan;
  });
  const chatDailyPlanId = daily?.chatDailyPlanId ?? null;
  const boardInfo = boardInfoQuery.isError ? null : boardInfoQuery.data;
  const manualDailyPlanIds = boardInfo?.manualDailyPlanIds ?? EMPTY_MANUAL_IDS;
  const categoryByDailyPlanId = boardInfo?.categoryByDailyPlanId ?? EMPTY_CATEGORY_MAP;

  const setPlans = (update: (prev: Plan[]) => Plan[]) => {
    queryClient.cancelQueries({ queryKey: dailyKey });
    queryClient.setQueryData<DailyPlans>(dailyKey, (prev) => prev && { ...prev, plans: update(prev.plans) });
  };

  const reloadDaily = () => queryClient.invalidateQueries({ queryKey: dailyKey });

  const reload = () => {
    invalidatePlanQueries();
  };

  const dayStartMs = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
  const isPast = (plan: Plan) => dayStartMs + (plan.start + plan.duration) * 60_000 <= now.getTime();
  const coloredPlans = plans.map((plan) => ({
    ...plan,
    status: plan.status === "pending" && isPast(plan) ? ("failed" as const) : plan.status,
    category: (plan.dailyPlanId !== undefined && categoryByDailyPlanId[plan.dailyPlanId]) || plan.category,
  }));

  const isManualPlan = (plan: Plan | null) =>
    plan?.dailyPlanId !== undefined && manualDailyPlanIds.includes(plan.dailyPlanId);

  const setPlanStatus = (id: string, status: PlanStatus) => {
    setStatusById((prev) => new Map(prev).set(id, status));
  };

  const savePlanEdit = (id: string, title: string, start: number, duration: number) => {
    const startMin = (start + WINDOW_START_MIN) % DAY_MIN;
    const startTime = toClockString(startMin);
    const endTime = toClockString((startMin + duration) % DAY_MIN);

    setPlans((prev) => prev.map((plan) => {
      if (plan.id !== id) return plan;
      const lines = plan.lines.map((line) => line.icon === "history"
        ? { ...line, text: `${startTime} - ${endTime} | ${formatDuration(duration)}` }
        : line);
      return { ...plan, title, start, duration, lines };
    }));

    updatePlanTask(Number(id), { taskName: title, startTime, endTime, estimatedMinutes: duration })
      .then(() => invalidateTaskQueries())
      .catch((error) => {
        reloadDaily();
        Alert.alert("수정 실패", getEditErrorMessage(error));
      });
  };

  const deletePlan = async (target: Plan) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== target.id));
    try {
      await deletePlanTask(Number(target.id));
      invalidateTaskQueries();
      return true;
    } catch {
      reloadDaily();
      Alert.alert("삭제 실패", "일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  };

  return { plans, coloredPlans, chatDailyPlanId, reload, isManualPlan, setPlanStatus, savePlanEdit, deletePlan };
}
