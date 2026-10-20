import { View } from "react-native";
import { Text } from "../../ui/Text";
import { getSpacing } from "@/utils/token";

// ================================
// Components
// ================================

interface Props {
  index: number;
  text: string;
}

/**
 * 문제 번호 태그(Q1)와 문제 글로 된 카드
 * @param index 문제 위치 (0부터)
 * @param text 문제 글
 */
export function QuestionCard({ index, text }: Props) {
  return (
    <View className="bg-neutral-700 rounded-radius-4 p-spacing-6 w-full" style={{ minHeight: 200, gap: getSpacing("spacing-11") }}>
      <View className="self-start bg-neutral-600 px-spacing-4 py-spacing-2 rounded-radius-2">
        <Text variant="header-small">{`Q${index + 1}`}</Text>
      </View>
      <Text variant="title-medium" className="text-center">{text}</Text>
    </View>
  );
}
