import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, Button } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { generateQuiz, submitQuiz } from "@/api/quiz";
import type { Quiz, QuizResult } from "@/api/quiz";
import type { Category } from "@/constants/category";
import palette from "@/constants/palette";

// ================================
// Types
// ================================

type OptionState = "default" | "selected" | "correct" | "wrong";
type Phase = "intro" | "answering" | "review" | "score";

// ================================
// Constants
// ================================

// 퀴즈 응답에 과목 정보가 없어 Home에서 넘겨준 카테고리로만 과목 태그 표시
const SUBJECT_LABELS: Partial<Record<Category, string>> = {
  "math": "수학",
  "english": "영어",
  "science": "과학",
  "social": "사회",
};

// ================================
// Styles
// ================================

const optionStyles: Record<OptionState, string> = {
  "default": "border-neutral-600",
  "selected": "border-primary-500 bg-primary-500/30",
  "correct": "border-utility-success-primary bg-utility-success-primary/30",
  "wrong": "border-utility-error-primary bg-utility-error-primary/30",
};

const optionIcons: Partial<Record<OptionState, { name: IconName; color: string }>> = {
  "correct": { name: "check", color: palette.utility["success-primary"] },
  "wrong": { name: "close", color: palette.utility["error-primary"] },
};

// ================================
// Components
// ================================

function OptionRow({ label, state, onPress }: { label: string; state: OptionState; onPress?: () => void }) {
  const icon = optionIcons[state];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row gap-s items-center justify-center p-xl rounded-md border-2 w-full ${optionStyles[state]}`}
    >
      {icon && <Icon name={icon.name} size={20} color={icon.color} />}
      <Text variant="base-large" className="text-center">{label}</Text>
    </Pressable>
  );
}

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <Row gap="xs" className="flex-1 h-[6px] items-center">
      {Array.from({ length: total }, (_, i) => (
        <View key={i} className={`flex-1 h-full rounded-full ${i <= current ? "bg-primary-500" : "bg-neutral-600"}`} />
      ))}
    </Row>
  );
}

function QuestionCard({ index, text }: { index: number; text: string }) {
  return (
    <View className="bg-neutral-700 rounded-md p-xl w-full" style={{ minHeight: 200, gap: 40 }}>
      <View className="self-start bg-neutral-600 px-m py-xs rounded-xs">
        <Text variant="header-small">{`Q${index + 1}`}</Text>
      </View>
      <Text variant="title-medium" className="text-center">{text}</Text>
    </View>
  );
}

// 해설 말풍선, 마스코트 쪽 모서리만 각지게
function ExplanationBubble({ text }: { text: string }) {
  return (
    <Row gap="m" width="full" className="items-end">
      <View className="flex-1 bg-neutral-700 px-xl py-l rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px]">
        <Text variant="base-large">{text}</Text>
      </View>
      <Icon name="mascotFace" size={52} />
    </Row>
  );
}

function ScoreCircle({ correct, total }: { correct: number; total: number }) {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <View
      className="w-[280px] h-[280px] rounded-full border-[10px] border-primary-500 items-center justify-center self-center"
      style={{
        gap: 24,
        experimental_backgroundImage: `linear-gradient(180deg, ${palette.quiz["score-top"]} 0%, ${palette.neutral["700"]} 100%)`,
      }}
    >
      <Text variant="header-large">나의 점수</Text>
      <Stack gap="xs" className="items-center">
        <Text weight="semibold" style={{ fontSize: 40, lineHeight: 50, letterSpacing: -0.4 }}>{`${score}점`}</Text>
        <Text variant="header-large">{`${correct}/${total}`}</Text>
      </Stack>
    </View>
  );
}

/**
 * 퀴즈 화면
 */
export default function QuizPage() {
  const { category } = useLocalSearchParams<{ category?: Category }>();
  const subjectLabel = category ? SUBJECT_LABELS[category] : undefined;
  const [phase, setPhase] = useState<Phase>("intro");
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
  const currentResult = result?.results.find((r) => r.questionId === current?.id);

  const handleStart = async () => {
    setPhase("answering");
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

  // 채점 API가 전체 제출만 받아서, 전부 푼 뒤 제출하고 1번부터 해설
  const handleConfirm = async () => {
    if (!current || selectedChoiceId === undefined || !quiz) return;
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const submission = questions.map((q) => ({ questionId: q.id, selectedChoiceId: answers[q.id] }));
      setResult(await submitQuiz(quiz.dailyPlanId, submission));
      setCurrentIndex(0);
      setPhase("review");
    } catch {
      setError("퀴즈 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewNext = () => {
    if (isLast) setPhase("score");
    else setCurrentIndex((i) => i + 1);
  };

  const goFeedback = () => {
    if (!quiz) return;
    router.replace({ pathname: "/home/FeedbackPage", params: { dailyPlanId: String(quiz.dailyPlanId) } });
  };

  const getOptionState = (choiceId: number): OptionState => {
    if (phase === "review" && currentResult) {
      if (choiceId === currentResult.correctChoiceId) return "correct";
      if (choiceId === currentResult.selectedChoiceId) return "wrong";
      return "default";
    }
    return selectedChoiceId === choiceId ? "selected" : "default";
  };

  if (phase === "intro") {
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
                <Row gap="m" className="items-center">
                  {subjectLabel && (
                    <View className="bg-primary-500/20 px-s py-xs rounded-xs">
                      <Text variant="base-medium" weight="medium" className="text-primary-500">{subjectLabel}</Text>
                    </View>
                  )}
                  <Text variant="title-medium">학습 테스트</Text>
                </Row>
                <Text variant="base-large">
                  사용자의 학습이 제대로 되었는지{"\n"}확인하기 위해 학습 테스트를 시작할게요
                </Text>
              </Stack>
            </Stack>
          </Stack>
          <Button variant="primary" onPress={handleStart}>시작</Button>
        </Stack>
      </View>
    );
  }

  if (phase === "score" && result) {
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <Stack align="between" width="full" className="flex-1">
          <Text variant="title-medium" className="pt-xxl">
            {`${subjectLabel ? `${subjectLabel} ` : ""}학습 테스트를\n완료했어요!`}
          </Text>
          <ScoreCircle correct={result.correctCount} total={result.totalQuestions} />
          <Button variant="primary" onPress={goFeedback}>다음</Button>
        </Stack>
      </View>
    );
  }

  const explanation = currentResult
    ? currentResult.explanation ?? (currentResult.correctChoiceText ? `정답은 ${currentResult.correctChoiceText}입니다.` : null)
    : null;

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          <Row gap="l" width="full" className="items-center">
            <Pressable onPress={() => router.back()} className="w-[28px] h-[28px] items-center justify-center">
              <Icon name="close" size={24} />
            </Pressable>
            {questions.length > 0 && <ProgressBar total={questions.length} current={currentIndex} />}
          </Row>

          {loading ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">퀴즈를 준비하고 있어요...</Text>
            </Stack>
          ) : error && !current ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">{error}</Text>
            </Stack>
          ) : !current ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">아직 준비된 퀴즈가 없어요.</Text>
            </Stack>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xxl" width="full">
                <QuestionCard index={currentIndex} text={current.questionText} />
                <Stack gap="m" width="full">
                  {current.choices.map((choice) => (
                    <OptionRow
                      key={choice.id}
                      label={choice.choiceText}
                      state={getOptionState(choice.id)}
                      onPress={phase === "answering" ? () => handleSelect(choice.id) : undefined}
                    />
                  ))}
                </Stack>
              </Stack>
            </ScrollView>
          )}
        </Stack>

        <Stack gap="xl" width="full" className="pt-l">
          {phase === "review" && explanation && <ExplanationBubble text={explanation} />}
          {error && current ? <Text variant="base-small" className="text-utility-error-primary">{error}</Text> : null}
          {loading ? null : phase === "review" ? (
            <Button variant="primary" onPress={handleReviewNext}>다음</Button>
          ) : !current ? (
            <Button variant="primary" onPress={() => router.back()}>확인</Button>
          ) : (
            <Button variant={selectedChoiceId === undefined || submitting ? "disabled" : "primary"} onPress={handleConfirm}>
              {submitting ? "채점 중..." : "확인"}
            </Button>
          )}
        </Stack>
      </Stack>
    </View>
  );
}
