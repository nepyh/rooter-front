import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LoadingView, PageHeader, PlanSection, Text } from "@/components";
import { usePlanBoards } from "@/hooks/home/usePlanBoards";
import { getSpacing } from "@/utils/common/token";

/**
 * 플랜 목록 화면. 진행 중인 플랜과 시험일이 지난 완료된 플랜을 나눠 보여주고(대표 플랜은 '대표' 표시), 플랜을 누르면 수정 화면으로 이동
 */
export default function PlanListPage() {
  const { inProgress, completed, representative, isPending, isError } = usePlanBoards();
  const isEmpty = inProgress.length === 0 && completed.length === 0;
  const emptyMessage = isError ? "플랜 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요." : "아직 만든 플랜이 없어요.";

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <PageHeader title="플랜 목록" />

      {isPending && <LoadingView />}
      {!isPending && isEmpty && <Text variant="base-medium" color="secondary">{emptyMessage}</Text>}
      {!isPending && !isEmpty && (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: getSpacing("spacing-9"), paddingBottom: getSpacing("spacing-9") }}
        >
          {inProgress.length > 0 && (
            <PlanSection title="진행 중인 플랜" boards={inProgress} representativeId={representative?.id ?? null} />
          )}
          {completed.length > 0 && (
            <PlanSection title="완료된 플랜" boards={completed} representativeId={representative?.id ?? null} />
          )}
        </ScrollView>
      )}
    </View>
  );
}
