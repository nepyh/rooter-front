import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, Button } from "@/components";
import { Icon } from "@/assets";
import { generateQuiz, submitQuiz } from "@/api/quiz";
import type { Quiz, QuizResult } from "@/api/quiz";

// ================================
// Types
// ================================

type OptionState = "default" | "selected";

// ================================
// Components
// ================================

const OPTION_STATE_STYLE: Record<OptionState, { borderColor: string; backgroundColor: string }> = {
  default: { borderColor: "#525866", backgroundColor: "transparent" },
  selected: { borderColor: "#F6482D", backgroundColor: "rgba(246,72,45,0.3)" },
};

function OptionRow({ label, state, onPress }: { label: string; state: OptionState; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-s items-center justify-center p-xl rounded-md border-2 w-full"
      style={OPTION_STATE_STYLE[state]}
    >
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}

/**
 * 퀴즈 화면
 */
export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> selectedChoiceId
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const questions = quiz?.questions ?? [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedChoiceId = current ? answers[current.id] : undefined;

  const handleStart = async () => {
    setStarted(true);
    setLoading(true);
    setError("");
    try {
      setQuiz(await generateQuiz());
    } catch {
      setError("퀴즈를 준비하지 못했습니다. 완료한 학습이 있는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (choiceId: number) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceId }));
  };

  const handlePrimary = async () => {
    if (!current || selectedChoiceId === undefined) return;

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    if (!quiz) return;

    setSubmitting(true);
    setError("");
    try {
      const submission = questions.map((q) => ({ questionId: q.id, selectedChoiceId: answers[q.id] }));
      setResult(await submitQuiz(quiz.dailyPlanId, submission));
    } catch {
      setError("퀴즈 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryLabel = isLast ? "제출" : "다음";
  const primaryVariant = selectedChoiceId === undefined ? "disabled" : "primary";

  if (!started) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <Stack align="between" width="full" className="flex-1">
          <Stack gap="xxl" width="full">
            <Pressable onPress={() => router.back()} className="w-[28px] h-[28px] items-center justify-center">
              <Icon name="close" size={24} />
            </Pressable>
            <Stack gap="xl" width="full">
              <Icon name="mascotFace" size={100} />
              <Stack gap="m" width="full">
                <Text variant="title-medium">학습 테스트</Text>
                <Text variant="base-large">
                  사용자의 학습이 제대로 되었는지{"\n"}확인하기 위해 학습 테스트를 시작할게요
                </Text>
              </Stack>
            </Stack>
          </Stack>
          <Button variant="primary" onPress={handleStart}> 시작 </Button>
        </Stack>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          <Row gap="l" width="full" className="items-center">
            <Pressable onPress={() => router.back()} className="w-[28px] h-[28px] items-center justify-center">
              <Icon name="close" size={24} />
            </Pressable>
            {questions.length > 0 && !result && (
              <Row gap="xs" className="flex-1 h-[6px] items-center">
                {questions.map((q, i) => (
                  <View
                    key={q.id}
                    className="flex-1 h-full rounded-full"
                    style={{ backgroundColor: i <= currentIndex ? "#F6482D" : "#525866" }}
                  />
                ))}
              </Row>
            )}
          </Row>

          {loading ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">퀴즈를 준비하고 있어요...</Text>
            </Stack>
          ) : result ? (
            <Stack gap="xl" width="full" className="flex-1 items-center justify-center">
              <Text variant="title-medium">{`${result.correctCount} / ${result.totalQuestions}`}</Text>
              <Text color="secondary">퀴즈를 완료했어요!</Text>
              {result.weakAreas.length > 0 && (
                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">복습이 필요해요</Text>
                  {result.weakAreas.map((area, i) => (
                    <View key={i} className="bg-neutral-700 p-m rounded-xs w-full">
                      <Text variant="base-medium" weight="medium">{area.chapterName}</Text>
                      <Text variant="base-small" color="secondary">{area.reviewTaskDescription}</Text>
                    </View>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : error ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">{error}</Text>
            </Stack>
          ) : questions.length === 0 ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">아직 준비된 퀴즈가 없어요.</Text>
            </Stack>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xxl" width="full">
                <View className="bg-neutral-700 rounded-md p-xl w-full" style={{ minHeight: 200 }}>
                  <View className="self-start bg-neutral-600 px-m py-xs rounded-xs">
                    <Text variant="header-small">{`Q${currentIndex + 1}`}</Text>
                  </View>
                  <View className="flex-1 w-full items-center justify-center">
                    <Text weight="semibold" className="text-center" style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.28 }}>
                      {current.questionText}
                    </Text>
                  </View>
                </View>

                <Stack gap="m" width="full">
                  {current.choices.map((choice) => (
                    <OptionRow
                      key={choice.id}
                      label={choice.choiceText}
                      state={selectedChoiceId === choice.id ? "selected" : "default"}
                      onPress={() => handleSelect(choice.id)}
                    />
                  ))}
                </Stack>
              </Stack>
            </ScrollView>
          )}
        </Stack>

        {loading ? null : result ? (
          <Button variant="primary" onPress={() => router.back()}>완료</Button>
        ) : error || questions.length === 0 ? (
          <Button variant="primary" onPress={() => router.back()}>확인</Button>
        ) : (
          <Button variant={submitting ? "disabled" : primaryVariant} onPress={handlePrimary}>
            {submitting ? "제출 중..." : primaryLabel}
          </Button>
        )}
      </Stack>
    </View>
  );
}
