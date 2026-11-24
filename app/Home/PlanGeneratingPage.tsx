import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, BackHeader, Button } from "@/components";
import { generatePlan } from "@/api/home/common/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";
import { getGenerateFailure, setRepresentativeIfMissing } from "@/api/home/PlanGeneratingPage";
import type { GenerateFailure, GenerateFailureAction } from "@/api/home/PlanGeneratingPage";
import { updateSleepTime } from "@/api/common/user";
import { updatePlanBoard } from "@/api/common/planBoard";
import { invalidatePlanQueries, queryClient, queryKeys } from "@/api/queryClient";
import { usePlanDraftStore, useUserStore } from "@/store";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { toSleepTimeInput } from "@/utils/home/sleepTime";

// ================================
// Constants
// ================================

// 시간 초과(home)는 서버가 아직 만들고 있을 수 있어 "못 했다"고 단정하지 않음
const FAILURE_TITLES: Record<GenerateFailureAction, string> = {
  "retry": "계획을 만들지 못했어요",
  "edit": "계획을 만들지 못했어요",
  "home": "시간이 오래 걸리고 있어요",
};

const FAILURE_BUTTON_LABELS: Record<GenerateFailureAction, string> = {
  "retry": "다시 시도",
  "edit": "입력 수정하기",
  "home": "홈으로",
};

// ================================
// Components
// ================================

/**
 * 플랜 생성 중 화면, 수면 시간 저장 뒤 AI 계획 생성
 * 수면 시간은 AI 가 일정을 배치할 때 쓰므로 생성 전에 저장하고, 저장에 실패해도 생성은 진행
 * 계획 생성 API 는 설명과 대표 플랜을 다루지 않아, 생성 뒤 입력한 설명을 저장하고 대표 플랜이 없으면 새 플랜을 대표로 지정함
 * 둘 다 플랜이 이미 만들어진 뒤라 실패해도 넘어감
 * 시험 시작일은 examDate, 종료일은 examEndDate 로 보내고 두 날이 같으면 하루짜리 시험이라 종료일은 보내지 않음. 계획은 시험 시작 전날까지 만들어짐
 * 생성에 실패해도 화면을 떠나지 않고, 입력값을 그대로 둔 채 실패 이유에 맞는 버튼(다시 시도·입력 수정·홈으로)을 보여줌
 */
export default function PlanGeneratingPage() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const userId = useUserStore((state) => state.userId);
  const leftRef = useRef(false);
  const [failure, setFailure] = useState<GenerateFailure | null>(null);

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

  const generate = async () => {
    const { title, description, examStartDate, examEndDate } = usePlanDraftStore.getState();
    const input = {
      title: title || (examStartDate ? `${examStartDate} 시험 대비` : "새 학습 계획"),
      subjects: JSON.parse(subjects ?? "[]") as PlanGenerationSubjectInput[],
      examDate: examStartDate ?? undefined,
      examEndDate: examEndDate !== null && examEndDate !== examStartDate ? examEndDate : undefined,
    };
    // 설명 저장과 대표 플랜 지정은 플랜이 이미 만들어진 뒤라 실패해도 넘어감
    const finishBoard = (planBoardId: number) =>
      Promise.all([
        description ? updatePlanBoard(planBoardId, { description }).catch(() => {}) : null,
        setRepresentativeIfMissing(planBoardId).catch(() => {}),
      ]);

    try {
      const generated = await generatePlan(input);
      await finishBoard(generated.planBoardId);
      invalidatePlanQueries();
    } catch (error) {
      if (!leftRef.current) setFailure(getGenerateFailure(error));
      return;
    }
    if (!leftRef.current) router.replace("/Home/Home");
  };

  // 수면 시간은 처음 들어왔을 때 한 번만 저장하고, 다시 시도할 때는 생성만 다시 요청
  const startGenerating = useEffectEvent(() => {
    saveSleepTime().then(generate);
  });

  useEffect(() => {
    startGenerating();
  }, []);

  const goBack = () => {
    leftRef.current = true;
    if (router.canGoBack()) router.back(); else router.replace("/Home/Home");
  };

  const goHome = () => {
    leftRef.current = true;
    invalidatePlanQueries();
    router.replace("/Home/Home");
  };

  const retry = () => {
    setFailure(null);
    generate();
  };

  const failureHandlers: Record<GenerateFailureAction, () => void> = {
    "retry": retry,
    "edit": goBack,
    "home": goHome,
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      {failure ? (
        <View className="flex-1">
          <View className="flex-1 items-center justify-center" style={{ gap: getSpacing("spacing-5") }}>
            <Text variant="title-small">{FAILURE_TITLES[failure.action]}</Text>
            <Text color="secondary" className="text-center">{failure.message}</Text>
          </View>
          <Button className="mb-spacing-6" onPress={failureHandlers[failure.action]}>
            {FAILURE_BUTTON_LABELS[failure.action]}
          </Button>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center" style={{ gap: getSpacing("spacing-8") }}>
          <ActivityIndicator size="large" color={color.primary["500"]} />
          <Text variant="title-small">플랜 생성 중...</Text>
        </View>
      )}
    </View>
  );
}
