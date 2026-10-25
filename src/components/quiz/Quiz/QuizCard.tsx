import { Pressable, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { CATEGORY_COLORS } from "@/constants/category";
import type { QuizItem } from "@/api/quiz/Quiz";
import { getSpacing } from "@/utils/common/token";

// ================================
// Styles
// ================================

const COMPLETED_TITLE_STYLE = { textDecorationLine: "line-through" as const };

// ================================
// Components
// ================================

interface Props {
  item: QuizItem;
  onPress: () => void;
}

/**
 * 퀴즈 카드 하나 (과목 색 막대 + 할일 이름 + 과목·시간). 완료한 퀴즈는 흐리게 줄 긋기
 * @param item 보여줄 퀴즈
 * @param onPress 카드를 눌렀을 때 호출
 */
export function QuizCard({ item, onPress }: Props) {
  const { task, subjectName, category } = item;
  const meta = [subjectName, `${task.startTime} - ${task.endTime}`].filter(Boolean).join(" | ");
  const isDone = task.status === "DONE";

  return (
    <Pressable onPress={onPress} className="flex-row bg-neutral-700 rounded-radius-2 p-spacing-2 w-full" style={{ gap: getSpacing("spacing-3"), minHeight: 80 }}>
      <View className="w-spacing-2 rounded-radius-full" style={{ backgroundColor: CATEGORY_COLORS[category].bar }} />
      <Stack gap="xs" className="flex-1 p-spacing-4">
        <Text
          variant="base-large"
          weight="medium"
          color={isDone ? "disabled" : "primary"}
          numberOfLines={1}
          style={isDone ? COMPLETED_TITLE_STYLE : undefined}
        >
          {task.taskName}
        </Text>
        <Text variant="base-medium" color="secondary">{meta}</Text>
      </Stack>
    </Pressable>
  );
}
