import { View, Pressable } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";

// ================================
// Constants
// ================================

// 공통 헤더를 빼고 보여줄 화면
// 문항 화면은 진행 막대를 붙인 헤더를 직접 그리고, 분석 중 화면은 뒤로가기가 없음
const NO_HEADER_PATHS = [
  "/LearningSurvey/StudySurveyQuestion",
  "/LearningSurvey/StudySurveyLoading",
];

export default function LearningSurveyLayout() {
  const pathname = usePathname();
  const showHeader = !NO_HEADER_PATHS.includes(pathname);

  return (
    <Stack gap="xl" className="flex-1 pb-spacing-11">
      {showHeader && (
        <View className="py-spacing-5">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronLeft" size={32} />
          </Pressable>
        </View>
      )}
      <Slot />
    </Stack>
  );
}
