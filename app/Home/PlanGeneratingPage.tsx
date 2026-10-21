import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, BackHeader } from "@/components";
import { generatePlan } from "@/api/home/common/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";
import { getGenerateErrorMessage } from "@/api/home/PlanGeneratingPage";
import { saveStudyStyleAnswers } from "@/api/common";
import { invalidatePlanQueries } from "@/api/queryClient";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

/**
 * 플랜 생성 중 화면, 설문 답변 저장 뒤 AI 계획 생성
 */
export default function PlanGeneratingPage() {
  const { plan, answers } = useLocalSearchParams<{ plan: string; answers?: string }>();
  const leftRef = useRef(false);

  useEffect(() => {
    const { examDate, subjects } = JSON.parse(plan ?? "{}") as { examDate?: string; subjects?: string };

    const run = async () => {
      if (answers) await saveStudyStyleAnswers(answers);
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
