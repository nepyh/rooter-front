import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Text, Input, Button, LoadingView } from "@/components";
import { getFeedback, submitFeedback } from "@/api/feedback";
import type { Difficulty, Feedback } from "@/api/feedback";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/token";

// ================================
// Types
// ================================

type ChipState = "default" | "selected";
type PickerTarget = "start" | "end";

// ================================
// Constants
// ================================

const DIFFICULTIES: Difficulty[] = ["쉬움", "적당", "어려움"];
const FOCUS_LEVELS = [1, 2, 3, 4, 5];
// 디자인 문구는 "중간", 서버 값은 "적당"
const DIFFICULTY_LABELS: Record<Difficulty, string> = { "쉬움": "쉬움", "적당": "중간", "어려움": "어려움" };

const pad = (n: number) => String(n).padStart(2, "0");
const formatClock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 10분 단위로 내린 지금 시각에서 minutesAgo 전
const roundedNow = (minutesAgo = 0) => {
  const date = new Date(Date.now() - minutesAgo * 60000);
  date.setMinutes(Math.floor(date.getMinutes() / 10) * 10, 0, 0);
  return date;
};

// 종료가 시작보다 이르면 자정을 넘긴 것으로 봄
const diffMinutes = (start: Date, end: Date) => {
  const diff = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
  return diff < 0 ? diff + 24 * 60 : diff;
};

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

// 구글 폼의 "필수 질문입니다" 안내
function RequiredNotice() {
  return <Text variant="base-small" style={{ color: color.utility["error-primary"] }}>필수 질문입니다</Text>;
}

function Chip({ label, state, onPress }: { label: string; state: ChipState; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`flex-1 items-center justify-center p-spacing-6 rounded-radius-4 border-2 ${chipStyles[state]}`}>
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}

// 누르면 아래로 시간 휠이 펼쳐지는 시각 칸
function TimeRow({ label, value, active, onPress, onChange }: {
  label: string;
  value: Date;
  active: boolean;
  onPress: () => void;
  onChange: (date: Date) => void;
}) {
  return (
    <View className="w-full bg-neutral-700 rounded-radius-4 px-spacing-6 py-spacing-5" style={{ gap: getSpacing("spacing-5") }}>
      <Pressable onPress={onPress} className="flex-row items-center justify-between w-full" style={{ minHeight: 34 }}>
        <Text variant="base-large" weight="medium">{label}</Text>
        <View className={`px-spacing-4 py-spacing-3 rounded-radius-full ${active ? "bg-primary-500" : "bg-neutral-600"}`}>
          <Text variant="base-small">{formatClock(value)}</Text>
        </View>
      </Pressable>
      {active && <TimeWheelPicker value={value} onChange={onChange} />}
    </View>
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
  const [startTime, setStartTime] = useState(() => roundedNow(60));
  const [endTime, setEndTime] = useState(() => roundedNow());
  const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);
  const timeSpent = diffMinutes(startTime, endTime);
  const togglePicker = (target: PickerTarget) => setActivePicker((prev) => (prev === target ? null : target));
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Feedback | null>(null);

  // 피드백은 일일 계획당 1번이라, 같은 날 다른 할일 퀴즈 뒤에는 설문 없이 Home으로
  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    getFeedback(planId)
      .then(() => router.replace("/home"))
      .catch(() => setLoading(false));
  }, [planId]);

  // 난이도·집중도·공부한 시간 모두 필수, 구글 폼처럼 [제출]을 누르면 빠진 항목에 안내
  const [showRequired, setShowRequired] = useState(false);
  const missing = { difficulty: !difficulty, focus: focusLevel === null, time: timeSpent <= 0 };
  const canSubmit = !missing.difficulty && !missing.focus && !missing.time && !submitting;

  const handleSubmit = async () => {
    if (!planId || submitting) return;
    if (!canSubmit || !difficulty || focusLevel === null) {
      setShowRequired(true);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      setResult(await submitFeedback(planId, {
        difficulty,
        timeSpentMinutes: timeSpent,
        focusLevel,
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
            <LoadingView />
          ) : !planId ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">오늘의 학습 계획을 찾을 수 없어요.</Text>
            </Stack>
          ) : result ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xl" width="full" className="pt-[100px]">
                <Icon name="mascotFace" size={100} />
                <Stack gap="m" width="full">
                  <Text variant="title-medium" weight="semibold">피드백을 완료했어요</Text>
                  <Text variant="base-large">
                    {`오늘 공부는 '${result.difficulty}'이었어요.\n${adjustmentTasks.length > 0 ? "남은 계획에 보충 학습을 추가했어요." : "추가된 보충 학습은 없어요."}`}
                  </Text>
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
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: getSpacing("spacing-7") }}>
              <Stack gap="l" width="full">
                <Icon name="mascotFace" size={76} />
                <Stack gap="xxl" width="full">
                  <Stack gap="s" width="full">
                    <Text variant="title-medium" weight="semibold">오늘 공부 어땠나요?</Text>
                    <Text variant="base-medium" color="secondary">답변을 바탕으로 남은 계획에 보충 학습을 추가해 드릴게요</Text>
                  </Stack>

                  <Stack gap="s" width="full">
                    <Text variant="base-medium">난이도</Text>
                    {showRequired && missing.difficulty && <RequiredNotice />}
                    <Row gap="s" width="full">
                      {DIFFICULTIES.map((item) => (
                        <Chip key={item} label={DIFFICULTY_LABELS[item]} state={difficulty === item ? "selected" : "default"} onPress={() => setDifficulty(item)} />
                      ))}
                    </Row>
                  </Stack>

                  <Stack gap="s" width="full">
                    <Text variant="base-medium">집중도</Text>
                    {showRequired && missing.focus && <RequiredNotice />}
                    <Row gap="s" width="full">
                      {FOCUS_LEVELS.map((level) => (
                        <Chip key={level} label={String(level)} state={focusLevel === level ? "selected" : "default"} onPress={() => setFocusLevel(level)} />
                      ))}
                    </Row>
                  </Stack>

                  <Stack gap="s" width="full">
                    <Text variant="base-medium">공부한 시간</Text>
                    {showRequired && missing.time && <RequiredNotice />}
                    <Stack gap="l" width="full">
                      <TimeRow label="시작 시간" value={startTime} active={activePicker === "start"} onPress={() => togglePicker("start")} onChange={setStartTime} />
                      <TimeRow label="종료한 시간" value={endTime} active={activePicker === "end"} onPress={() => togglePicker("end")} onChange={setEndTime} />
                    </Stack>
                  </Stack>
                </Stack>

                {error ? <Text variant="base-small" className="text-utility-error-primary">{error}</Text> : null}
              </Stack>
            </ScrollView>
          )}
        </Stack>

        {loading ? null : result || !planId ? (
          <Button variant="primary" onPress={close}>학습 테스트 종료</Button>
        ) : (
          <Button variant={submitting ? "disabled" : "primary"} onPress={handleSubmit}>
            {submitting ? "제출 중..." : "선택"}
          </Button>
        )}
      </Stack>
    </View>
  );
}
