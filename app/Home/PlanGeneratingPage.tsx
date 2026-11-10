import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, BackHeader } from "@/components";
import { generatePlan } from "@/api/home/common/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";
import { getGenerateErrorMessage } from "@/api/home/PlanGeneratingPage";
import { saveStudyStyleAnswers } from "@/api/common";
import { updateSleepTime } from "@/api/common/user";
import { invalidatePlanQueries, queryClient, queryKeys } from "@/api/queryClient";
import { useUserStore } from "@/store";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { toSleepTimeInput } from "@/utils/home/sleepTime";

/**
 * 플랜 생성 중 화면, 설문 답변·수면 시간 저장 뒤 AI 계획 생성
 * 수면 시간은 AI 가 일정을 배치할 때 쓰므로 생성 전에 저장하고, 저장에 실패해도 생성은 진행
 */
export default function PlanGeneratingPage() {
  const { plan, answers } = useLocalSearchParams<{ plan: string; answers?: string }>();
  const userId = useUserStore((state) => state.userId);
  const leftRef = useRef(false);

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
      if (answers) await saveStudyStyleAnswers(answers);
      await saveSleepTime();
      try {
        await generatePlan({
          title: examDate ? `${examDate} 시험 대비` : "새 학습 계획",
          subjects: JSON.parse(subjects ?? "[]") as PlanGenerationSubjectInput[],
          examDate: examDate || undefined,
        });
        invalidatePlanQueries();
        if (!leftRef.current) router.replace("/Home/Home");
      } catch (error) {
        if (leftRef.current) return;
        Alert.alert("계획 생성 실패", getGenerateErrorMessage(error), [{ text: "확인", onPress: () => router.back() }]);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    leftRef.current = true;
    if (router.canGoBack()) router.back(); else router.replace("/Home/Home");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      <View className="flex-1 items-center justify-center" style={{ gap: getSpacing("spacing-8") }}>
        <ActivityIndicator size="large" color={color.primary["500"]} />
        <Text variant="title-small">플랜 생성 중...</Text>
      </View>
    </View>
  );
}
