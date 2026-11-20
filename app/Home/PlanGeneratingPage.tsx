import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, BackHeader } from "@/components";
import { generatePlan } from "@/api/home/common/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";
import { getGenerateErrorMessage, setRepresentativeIfMissing } from "@/api/home/PlanGeneratingPage";
import { updateSleepTime } from "@/api/common/user";
import { updatePlanBoard } from "@/api/common/planBoard";
import { invalidatePlanQueries, queryClient, queryKeys } from "@/api/queryClient";
import { usePlanDraftStore, useUserStore } from "@/store";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { toSleepTimeInput } from "@/utils/home/sleepTime";

/**
 * 플랜 생성 중 화면, 수면 시간 저장 뒤 AI 계획 생성
 * 수면 시간은 AI 가 일정을 배치할 때 쓰므로 생성 전에 저장하고, 저장에 실패해도 생성은 진행
 * 계획 생성 API 는 설명과 대표 플랜을 다루지 않아, 생성 뒤 입력한 설명을 저장하고 대표 플랜이 없으면 새 플랜을 대표로 지정함
 * 둘 다 플랜이 이미 만들어진 뒤라 실패해도 넘어감
 * 시험 시작일은 examDate, 종료일은 examEndDate 로 보내고 두 날이 같으면 하루짜리 시험이라 종료일은 보내지 않음. 계획은 시험 시작 전날까지 만들어짐
 */
export default function PlanGeneratingPage() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const userId = useUserStore((state) => state.userId);
  const leftRef = useRef(false);

  useEffect(() => {
    const { subjects, wakeTime, sleepHours } = JSON.parse(plan ?? "{}") as {
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
      const { title, description, examStartDate, examEndDate } = usePlanDraftStore.getState();
      await saveSleepTime();
      try {
        const generated = await generatePlan({
          title: title || (examStartDate ? `${examStartDate} 시험 대비` : "새 학습 계획"),
          subjects: JSON.parse(subjects ?? "[]") as PlanGenerationSubjectInput[],
          examDate: examStartDate ?? undefined,
          examEndDate: examEndDate !== null && examEndDate !== examStartDate ? examEndDate : undefined,
        });
        await Promise.all([
          description ? updatePlanBoard(generated.planBoardId, { description }).catch(() => {}) : null,
          setRepresentativeIfMissing(generated.planBoardId).catch(() => {}),
        ]);
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
