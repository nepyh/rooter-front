import { ScrollView, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { Feedback } from "@/api/quiz/FeedbackPage";

// ================================
// Components
// ================================

interface Props {
  result: Feedback;
}

/**
 * 피드백 제출 완료 화면. 고른 난이도와 남은 계획에 추가된 보충 학습 목록을 보여줌
 * @param result 제출한 피드백 결과
 */
export function FeedbackResult({ result }: Props) {
  const adjustmentTasks = result.insertedAdjustmentTasks ?? [];
  const summary = adjustmentTasks.length > 0 ? "남은 계획에 보충 학습을 추가했어요." : "추가된 보충 학습은 없어요.";

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Stack gap="xl" width="full" className="pt-[100px]">
        <Icon name="mascotFace" size={100} />
        <Stack gap="m" width="full">
          <Text variant="title-medium" weight="semibold">피드백을 완료했어요</Text>
          <Text variant="base-large">{`오늘 공부는 '${result.difficulty}'이었어요.\n${summary}`}</Text>
        </Stack>
        {adjustmentTasks.length > 0 && (
          <Stack gap="s" width="full">
            {adjustmentTasks.map((task, i) => (
              <View key={i} className="bg-neutral-700 p-spacing-4 rounded-radius-2 w-full">
                <Text variant="base-medium" weight="medium">{task.taskName}</Text>
                <Text variant="base-small" color="secondary">{task.planDate}</Text>
              </View>
            ))}
          </Stack>
        )}
      </Stack>
    </ScrollView>
  );
}
