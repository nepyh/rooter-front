import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { deletePlanTask, fillTaskSubjects, getDailyTasks, updatePlanTask } from "@/api/common/planBoard";
import { getEditErrorMessage } from "@/api/home/Home";
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
// Hooks
// ================================

/**
 * usePlans — 홈 타임라인에 그릴 그날의 일정 조회·수정·삭제
 * 화면에 다시 들어올 때마다 최신 목록을 다시 불러옵니다.
 * @param selectedDate 보고 있는 날짜
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @param now 현재 시각, 끝난 시각이 지난 미완료 일정을 실패로 표시할 때 씀
 * @returns plans(원본), coloredPlans(실패 상태 반영), chatDailyPlanId, reload, setPlanStatus, savePlanEdit, deletePlan
 */
export function usePlans(selectedDate: Date, selectedKey: string, now: Date) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [chatDailyPlanId, setChatDailyPlanId] = useState<number | null>(null);

  const loadDailyTasks = useCallback(() => {
    getDailyTasks(selectedKey)
      .then((daily) => fillTaskSubjects(daily.tasks))
      .then((tasks) => {
        setChatDailyPlanId(tasks[0]?.dailyPlanId ?? null);
        setPlans(tasks.map(mapPlanTaskToPlan));
      })
      .catch(() => {
        setChatDailyPlanId(null);
        setPlans([]);
      });
  }, [selectedKey]);

  useFocusEffect(loadDailyTasks);

  const reload = loadDailyTasks;

  const dayStartMs = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
  const isPast = (plan: Plan) => dayStartMs + (plan.start + plan.duration) * 60_000 <= now.getTime();
  const coloredPlans = plans.map((plan) => ({
    ...plan,
    status: plan.status === "pending" && isPast(plan) ? ("failed" as const) : plan.status,
  }));

  const setPlanStatus = (id: string, status: PlanStatus) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, status } : plan)));
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
      .catch((error) => {
        loadDailyTasks();
        Alert.alert("수정 실패", getEditErrorMessage(error));
      });
  };

  const deletePlan = async (target: Plan) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== target.id));
    try {
      await deletePlanTask(Number(target.id));
      return true;
    } catch {
      loadDailyTasks();
      Alert.alert("삭제 실패", "일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  };

  return { plans, coloredPlans, chatDailyPlanId, reload, setPlanStatus, savePlanEdit, deletePlan };
}
