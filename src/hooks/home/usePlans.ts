import { Alert } from "react-native";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { deletePlanTask, getDailyTasks, updatePlanTask } from "@/api/common/planBoard";
import { getEditErrorMessage, getFailErrorMessage } from "@/api/home/Home";
import { invalidatePlanQueries, invalidateTaskQueries, queryClient, queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { usePlanNames } from "@/hooks/home/usePlanNames";
import { DAY_MIN } from "@/utils/common/time";
import {
  WINDOW_START_MIN,
  formatDuration,
  mapPlanTaskToPlan,
  toClockString,
  withPlanNames,
  type Plan,
} from "@/utils/home/timeline";

// ================================
// Types
// ================================

interface DailyPlans {
  chatDailyPlanId: number | null;
  plans: Plan[];
}

// ================================
// Query Options
// ================================

/**
 * 그날 할 일 쿼리 설정. usePlans 와 옆 페이지(useNeighborDay)가 함께 씀
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

// ================================
// Hooks
// ================================

/**
 * usePlans — 홈 타임라인에 그릴 그날의 일정 조회·수정·삭제
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * 수정·삭제·실패 처리는 캐시를 먼저 고쳐 바로 반영하고, 서버 반영에 실패하면 그날 목록을 다시 불러옵니다.
 * @param selectedDate 보고 있는 날짜
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @returns plans(원본), coloredPlans(실패·과목 색·플랜 이름 반영), plansLoaded(그날 할 일을 불러왔는지), chatDailyPlanId, reload, savePlanEdit, deletePlan, failPlan
 */
export function usePlans(selectedDate: Date, selectedKey: string) {
  const dailyKey = queryKeys.tasks.daily(selectedKey);

  const dailyQuery = useQuery(dailyPlansQueryOptions(selectedKey));
  const planNames = usePlanNames();

  useRefetchOnFocus([dailyKey]);

  const daily = dailyQuery.isError ? null : dailyQuery.data;
  const plans = daily?.plans ?? [];
  const chatDailyPlanId = daily?.chatDailyPlanId ?? null;
  // 불러오는 중이거나 실패해도 chatDailyPlanId 는 null 이라, "계획 없음"과 구분하려고 따로 둠
  const plansLoaded = dailyQuery.isSuccess;

  const setPlans = (update: (prev: Plan[]) => Plan[]) => {
    queryClient.cancelQueries({ queryKey: dailyKey });
    queryClient.setQueryData<DailyPlans>(dailyKey, (prev) => prev && { ...prev, plans: update(prev.plans) });
  };

  const reloadDaily = () => queryClient.invalidateQueries({ queryKey: dailyKey });

  const reload = () => {
    invalidatePlanQueries();
  };

  const coloredPlans = withPlanNames(plans, planNames);

  const savePlanEdit = (id: string, title: string, start: number, duration: number) => {
    const startMin = (start + WINDOW_START_MIN) % DAY_MIN;
    const startTime = toClockString(startMin);
    const endTime = toClockString((startMin + duration) % DAY_MIN);

    setPlans((prev) => prev.map((plan) => {
      if (plan.id !== id) return plan;
      const lines = plan.lines.map((line) => line.icon === "history"
        ? { ...line, text: `${startTime} - ${endTime} | ${formatDuration(duration)}` }
        : { ...line, text: title });
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

  const failPlan = async (target: Plan) => {
    setPlans((prev) => prev.map((plan) => (plan.id === target.id ? { ...plan, status: "failed" } : plan)));
    try {
      await updatePlanTask(Number(target.id), { status: "FAILED" });
      invalidateTaskQueries();
    } catch (error) {
      reloadDaily();
      Alert.alert("처리 실패", getFailErrorMessage(error));
    }
  };

  return { plans, coloredPlans, plansLoaded, chatDailyPlanId, reload, savePlanEdit, deletePlan, failPlan };
}
