import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BackHeader, PageTitle, PlanInfoFields, NextButton } from "@/components";
import { usePlanDraftStore } from "@/store";
import { getSpacing } from "@/utils/common/token";

/**
 * 플랜 만들기 첫 화면. 플랜 이름(필수)과 설명을 받아 두고 시험 시작 날짜 선택 화면으로 넘어감
 */
export default function PlanInfoPage() {
  const [title, setTitle] = useState(() => usePlanDraftStore.getState().title);
  const [description, setDescription] = useState(() => usePlanDraftStore.getState().description);
  const setInfo = usePlanDraftStore((state) => state.setInfo);
  const canNext = title.trim().length > 0;

  const handleNext = () => {
    if (!canNext) return;
    setInfo(title.trim(), description.trim());
    router.push("/Home/ExamStartDatePage");
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/Home"));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      <PageTitle title="플랜 정보 설정" description="플랜과 관련된 정보를 입력해주세요" className="pb-spacing-6" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ gap: getSpacing("spacing-8"), paddingBottom: getSpacing("spacing-9") }}
      >
        <PlanInfoFields title={title} description={description} onChangeTitle={setTitle} onChangeDescription={setDescription} />
      </ScrollView>

      <NextButton onPress={handleNext} disabled={!canNext} className="mb-spacing-6" />
    </View>
  );
}
