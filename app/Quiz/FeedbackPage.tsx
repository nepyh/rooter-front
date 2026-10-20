import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Stack,
  Row,
  Text,
  Button,
  LoadingView,
  CenterMessage,
  FeedbackChip,
  FeedbackField,
  FeedbackTimeRow,
  FeedbackResult,
} from "@/components";
import { Icon } from "@/assets";
import type { Difficulty } from "@/api/quiz/FeedbackPage";
import { useFeedback } from "@/hooks/quiz/useFeedback";
import { getSpacing } from "@/utils/token";

// ================================
// Constants
// ================================

const DIFFICULTIES: Difficulty[] = ["쉬움", "적당", "어려움"];
const FOCUS_LEVELS = [1, 2, 3, 4, 5];

/**
 * 난이도 보기 문구. 서버 값 "적당" 을 디자인 문구 "중간" 으로 보여줌
 */
const DIFFICULTY_LABELS: Record<Difficulty, string> = { "쉬움": "쉬움", "적당": "중간", "어려움": "어려움" };

// ================================
// Components
// ================================

/**
 * 학습 피드백 화면
 */
export default function FeedbackPage() {
  const { dailyPlanId } = useLocalSearchParams<{ dailyPlanId?: string }>();
  const planId = Number(dailyPlanId);
  const feedback = useFeedback(planId);
  const { loading, result, missing, showRequired, activePicker, submitting } = feedback;

  const close = () => (router.canGoBack() ? router.back() : router.replace("/Home/Home"));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          {loading ? (
            <LoadingView />
          ) : !planId ? (
            <CenterMessage text="오늘의 학습 계획을 찾을 수 없어요." />
          ) : result ? (
            <FeedbackResult result={result} />
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: getSpacing("spacing-7") }}>
              <Stack gap="l" width="full">
                <Icon name="mascotFace" size={76} />
                <Stack gap="xxl" width="full">
                  <Stack gap="s" width="full">
                    <Text variant="title-medium" weight="semibold">오늘 공부 어땠나요?</Text>
                    <Text variant="base-medium" color="secondary">답변을 바탕으로 남은 계획에 보충 학습을 추가해 드릴게요</Text>
                  </Stack>

                  <FeedbackField label="난이도" showRequired={showRequired && missing.difficulty}>
                    <Row gap="s" width="full">
                      {DIFFICULTIES.map((item) => (
                        <FeedbackChip key={item} label={DIFFICULTY_LABELS[item]} selected={feedback.difficulty === item} onPress={() => feedback.setDifficulty(item)} />
                      ))}
                    </Row>
                  </FeedbackField>

                  <FeedbackField label="집중도" showRequired={showRequired && missing.focus}>
                    <Row gap="s" width="full">
                      {FOCUS_LEVELS.map((level) => (
                        <FeedbackChip key={level} label={String(level)} selected={feedback.focusLevel === level} onPress={() => feedback.setFocusLevel(level)} />
                      ))}
                    </Row>
                  </FeedbackField>

                  <FeedbackField label="공부한 시간" showRequired={showRequired && missing.time}>
                    <Stack gap="l" width="full">
                      <FeedbackTimeRow label="시작 시간" value={feedback.startTime} active={activePicker === "start"} onPress={() => feedback.togglePicker("start")} onChange={feedback.setStartTime} />
                      <FeedbackTimeRow label="종료한 시간" value={feedback.endTime} active={activePicker === "end"} onPress={() => feedback.togglePicker("end")} onChange={feedback.setEndTime} />
                    </Stack>
                  </FeedbackField>
                </Stack>

                {feedback.error ? <Text variant="base-small" className="text-utility-error-primary">{feedback.error}</Text> : null}
              </Stack>
            </ScrollView>
          )}
        </Stack>

        {loading ? null : result || !planId ? (
          <Button variant="primary" onPress={close}>학습 테스트 종료</Button>
        ) : (
          <Button variant={submitting ? "disabled" : "primary"} onPress={feedback.submit}>
            {submitting ? "제출 중..." : "선택"}
          </Button>
        )}
      </Stack>
    </View>
  );
}
