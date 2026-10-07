import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Text, Input, Button } from "@/components";
import { getFeedback, submitFeedback } from "@/api/feedback";
import type { Difficulty, Feedback } from "@/api/feedback";

// ================================
// Types
// ================================

type ChipState = "default" | "selected";

// ================================
// Constants
// ================================

const DIFFICULTIES: Difficulty[] = ["쉬움", "적당", "어려움"];
const FOCUS_LEVELS = [1, 2, 3, 4, 5];

// 피드백 제출 실패 시 백엔드 code별 안내 문구
const SUBMIT_ERROR_MESSAGES: Record<string, string> = {
  "FEEDBACK_001": "난이도를 선택해주세요.",
  "FEEDBACK_002": "공부한 시간을 다시 확인해주세요.",
  "FEEDBACK_003": "집중도는 1~5 사이로 선택해주세요.",
  "DAILY_PLAN_NOT_FOUND": "오늘의 학습 계획을 찾을 수 없어요.",
};

// ================================
// Styles
// ================================

const chipStyles: Record<ChipState, string> = {
  "default": "border-neutral-600",
  "selected": "border-primary-500 bg-primary-500/30",
};

// ================================
// Components
// ================================

function Chip({ label, state, onPress }: { label: string; state: ChipState; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`flex-1 items-center justify-center py-xl rounded-md border-2 ${chipStyles[state]}`}>
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}

/**
 * 학습 피드백 화면
 */
export default function FeedbackPage() {
  const { dailyPlanId } = useLocalSearchParams<{ dailyPlanId?: string }>();
  const planId = Number(dailyPlanId);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [timeSpent, setTimeSpent] = useState("");
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Feedback | null>(null);

  // 이미 제출한 피드백이 있으면 결과 화면으로 바로 표시
  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    getFeedback(planId)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [planId]);

  const handleSubmit = async () => {
    if (!planId || !difficulty) return;
    setSubmitting(true);
    setError("");
    try {
      setResult(await submitFeedback(planId, {
        difficulty,
        timeSpentMinutes: timeSpent ? Number(timeSpent) : undefined,
        focusLevel: focusLevel ?? undefined,
      }));
    } catch (e) {
      const code = axios.isAxiosError(e) ? e.response?.data?.code : undefined;
      if (code === "FEEDBACK_ALREADY_SUBMITTED") {
        getFeedback(planId).then(setResult).catch(() => setError("이미 제출한 피드백이 있어요."));
      } else {
        setError(SUBMIT_ERROR_MESSAGES[code] ?? "피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 제출 전에는 안드로이드 뒤로가기로 못 나가고 [제출]로만 나가기
  const mustSubmit = !loading && !!planId && !result;
  useEffect(() => {
    if (!mustSubmit) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, [mustSubmit]);

  const adjustmentTasks = result?.insertedAdjustmentTasks ?? [];

  // 링크로 바로 열린 경우 돌아갈 화면이 없어 Home으로 이동
  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          {loading ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">불러오는 중...</Text>
            </Stack>
          ) : !planId ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">오늘의 학습 계획을 찾을 수 없어요.</Text>
            </Stack>
          ) : result ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xl" width="full">
                <Stack gap="m" width="full">
                  <Text variant="title-medium">피드백 완료</Text>
                  <Text variant="base-large" color="secondary">{`오늘 공부는 '${result.difficulty}'이었어요`}</Text>
                </Stack>
                {adjustmentTasks.length > 0 ? (
                  <Stack gap="s" width="full">
                    <Text variant="base-medium" weight="medium">계획에 추가된 보충 학습</Text>
                    {adjustmentTasks.map((task, i) => (
                      <View key={i} className="bg-neutral-700 p-m rounded-xs w-full">
                        <Text variant="base-medium" weight="medium">{task.taskName}</Text>
                        <Text variant="base-small" color="secondary">{task.planDate}</Text>
                      </View>
                    ))}
                  </Stack>
                ) : (
                  <Text color="secondary">추가된 보충 학습은 없어요.</Text>
                )}
              </Stack>
            </ScrollView>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xxl" width="full">
                <Stack gap="m" width="full">
                  <Text variant="title-medium">오늘 공부 어땠나요?</Text>
                  <Text variant="base-large" color="secondary">
                    답변을 바탕으로 남은 계획에{"\n"}보충 학습을 추가해 드릴게요
                  </Text>
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">난이도</Text>
                  <Row gap="m" width="full">
                    {DIFFICULTIES.map((item) => (
                      <Chip key={item} label={item} state={difficulty === item ? "selected" : "default"} onPress={() => setDifficulty(item)} />
                    ))}
                  </Row>
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">집중도</Text>
                  <Row gap="s" width="full">
                    {FOCUS_LEVELS.map((level) => (
                      <Chip key={level} label={String(level)} state={focusLevel === level ? "selected" : "default"} onPress={() => setFocusLevel(level)} />
                    ))}
                  </Row>
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">공부한 시간</Text>
                  <Input
                    value={timeSpent}
                    onChangeText={(text) => setTimeSpent(text.replace(/[^0-9]/g, ""))}
                    placeholder="분 단위로 입력"
                    keyboardType="number-pad"
                  />
                </Stack>

                {error ? <Text variant="base-small" className="text-utility-error-primary">{error}</Text> : null}
              </Stack>
            </ScrollView>
          )}
        </Stack>

        {loading ? null : result || !planId ? (
          <Button variant="primary" onPress={close}>완료</Button>
        ) : (
          <Button variant={difficulty && !submitting ? "primary" : "disabled"} onPress={handleSubmit}>
            {submitting ? "제출 중..." : "제출"}
          </Button>
        )}
      </Stack>
    </View>
  );
}
