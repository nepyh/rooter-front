import { View } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

/**
 * 퀴즈 탭 맨 위 제목 줄. 아래 구분선이 화면 양 끝까지 닿도록 레이아웃 좌우 여백만큼 넓혀 그림
 */
export function QuizTabHeader() {
  return (
    <View className="-mx-spacing-7 px-spacing-7 pt-spacing-9 pb-spacing-5 border-b border-neutral-600">
      <Text variant="header-large" weight="semibold">퀴즈</Text>
    </View>
  );
}
