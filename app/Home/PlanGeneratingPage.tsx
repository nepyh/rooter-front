import { useEffect } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LoadingScreen } from "@/components";
import { generatePlan } from "@/api/home/common/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";
import { getGenerateErrorMessage } from "@/api/home/PlanGeneratingPage";
import { updateSleepTime } from "@/api/common/user";
import { invalidatePlanQueries, queryClient, queryKeys } from "@/api/queryClient";
import { useUserStore } from "@/store";
import { toSleepTimeInput } from "@/utils/home/sleepTime";

/**
 * 플랜 생성 중 화면, 수면 시간 저장 뒤 AI 계획 생성
 * 수면 시간은 AI 가 일정을 배치할 때 쓰므로 생성 전에 저장하고, 저장에 실패해도 생성은 진행
 */
export default function PlanGeneratingPage() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    const { examDate, subjects, wakeTime, sleepHours } = JSON.parse(plan ?? "{}") as {
      examDate?: string;
      subjects?: string;
      wakeTime?: string;
      sleepHours?: number;
    };

    const saveSleepTime = async () => {
      if (userId === null || !wakeTime || !sleepHours) return;
      await updateSleepTime(userId, toSleepTimeInput(wakeTime, sleepHours))
        .then((saved) => queryClient.setQueryData(queryKeys.users.sleepTime(userId), saved))
        .catch(() => {});
    };

    const run = async () => {
      await saveSleepTime();
      try {
        await generatePlan({
          title: examDate ? `${examDate} 시험 대비` : "새 학습 계획",
          subjects: JSON.parse(subjects ?? "[]") as PlanGenerationSubjectInput[],
          examDate: examDate || undefined,
        });
        invalidatePlanQueries();
        router.replace("/Home/Home");
      } catch (error) {
        Alert.alert("계획 생성 실패", getGenerateErrorMessage(error), [{ text: "확인", onPress: () => router.back() }]);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingScreen text="플랜 생성 중..." />;
}
