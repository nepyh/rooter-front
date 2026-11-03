import { View, Pressable } from "react-native";
import { Slot, router, usePathname } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";

// ================================
// Constants
// ================================

// 뒤로가기 버튼 옆에 진행 막대를 붙인 헤더를 화면이 직접 그려서, 공통 헤더를 빼고 보여줌
const NO_HEADER_PATHS = ["/LearningSurvey/StudySurveyQuestion"];

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
