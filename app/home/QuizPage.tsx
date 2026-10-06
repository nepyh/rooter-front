import { useRef, useState } from "react";
import axios from "axios";
import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, Button } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { answerTaskQuizQuestion, getTaskQuiz, submitTaskQuiz } from "@/api/quiz";
import type { TaskQuiz, TaskQuizAnswerResult, TaskQuizResult } from "@/api/quiz";
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

// 퀴즈 조회·채점 실패 시 백엔드 code별 안내 문구
const QUIZ_ERROR_MESSAGES: Record<string, string> = {
  "TASK_QUIZ_NOT_FOUND": "퀴즈가 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.",
  "TASK_QUIZ_ALREADY_SUBMITTED": "이미 채점이 끝난 퀴즈예요.",
  "TASK_QUIZ_INCOMPLETE_ANSWERS": "아직 풀지 않은 문제가 있어요.",
  "TASK_QUIZ_INVALID_ANSWER": "보기를 다시 선택해주세요.",
};

const getQuizErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") return "퀴즈를 만드는 데 시간이 오래 걸리고 있어요. 다시 시도해주세요.";
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return QUIZ_ERROR_MESSAGES[code] ?? fallback;
};

// 점수 화면 아래 결과 안내, 디자인에 없어 한 줄로만 표시
const getResultNotice = (result: TaskQuizResult) => {
  if (result.passed) return "통과! 할 일이 완료 처리됐어요.";
  if (result.taskInvalidated) return "세 번 모두 통과하지 못해 이번 할 일은 미완료로 확정됐어요.";
  if (result.retryScheduled) return "10분 뒤 새 문제로 다시 도전할 수 있어요. 남은 일정은 15분씩 미뤄졌어요.";
  return null;
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
  const { taskId, dailyPlanId, category } = useLocalSearchParams<{ taskId?: string; dailyPlanId?: string; category?: Category }>();
  const subjectLabel = category ? SUBJECT_LABELS[category] : undefined;
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<TaskQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> selectedChoiceId
  const [graded, setGraded] = useState<Record<number, TaskQuizAnswerResult>>({}); // 문제마다 즉시 채점 결과
  const gradedRef = useRef(graded);
  gradedRef.current = graded;
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<TaskQuizResult | null>(null);

  const questions = quiz?.questions ?? [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedChoiceId = current ? answers[current.id] : undefined;
  const currentGrade = current ? graded[current.id] : undefined;

  const submit = async (id: number) => {
    setChecking(true);
    setError("");
    try {
      setResult(await submitTaskQuiz(id));
      // 풀 때 문항마다 풀이를 이미 봤으면 바로 점수, 아니면 1번부터 풀이 보기
      const sawAllExplanations = questions.length > 0 && questions.every((q) => !!gradedRef.current[q.id]?.explanation);
      setCurrentIndex(0);
      setPhase(sawAllExplanations ? "score" : "review");
    } catch (e) {
      setError(getQuizErrorMessage(e, "채점 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setChecking(false);
    }
  };

  // 이미 답한 문제는 건너뛰고 안 푼 문제부터 이어 풀기
  const handleStart = async () => {
    const id = Number(taskId);
    setPhase("answering");
    if (!id) {
      setError("퀴즈를 풀 할 일을 찾지 못했어요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getTaskQuiz(id);
      setQuiz(data);
      setAnswers(Object.fromEntries(data.questions.filter((q) => q.selectedChoiceId !== null).map((q) => [q.id, q.selectedChoiceId as number])));
      const firstOpen = data.questions.findIndex((q) => q.selectedChoiceId === null);
      if (firstOpen === -1) await submit(id);
      else setCurrentIndex(firstOpen);
    } catch (e) {
      setError(getQuizErrorMessage(e, "퀴즈를 준비하지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (choiceId: number) => {
    if (!current || currentGrade) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceId }));
  };

  // [확인]: 이 문제만 제출해 바로 채점
  const handleConfirm = async () => {
    if (!current || selectedChoiceId === undefined || !quiz) return;
    setChecking(true);
    setError("");
    try {
      const grade = await answerTaskQuizQuestion(quiz.planTaskId, current.id, selectedChoiceId);
      setGraded((prev) => ({ ...prev, [current.id]: grade }));
    } catch (e) {
      const code = axios.isAxiosError(e) ? e.response?.data?.code : undefined;
      if (code === "TASK_QUIZ_QUESTION_ALREADY_ANSWERED") handleNext(); // 이미 답한 문제는 다음으로
      else setError(getQuizErrorMessage(e, "채점하지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setChecking(false);
    }
  };

  // [다음]: 마지막 문제 뒤에 전체 제출해 풀이 보기
  const handleNext = () => {
    if (!quiz) return;
    if (isLast) submit(quiz.planTaskId);
    else setCurrentIndex((i) => i + 1);
  };

  // 풀이 보기 [다음]: 마지막이면 점수 화면
  const handleReviewNext = () => {
    if (isLast) setPhase("score");
    else setCurrentIndex((i) => i + 1);
  };

  const reviewResult = phase === "review" && current ? result?.results.find((r) => r.questionId === current.id) : undefined;

  const goFeedback = () => {
    if (!dailyPlanId) {
      router.back();
      return;
    }
    router.replace({ pathname: "/home/FeedbackPage", params: { dailyPlanId } });
  };

  const getOptionState = (choiceId: number): OptionState => {
    if (reviewResult) {
      if (choiceId === reviewResult.correctChoiceId) return "correct";
      if (choiceId === reviewResult.selectedChoiceId) return "wrong";
      return "default";
    }
    if (currentGrade) {
      if (choiceId === currentGrade.correctChoiceId) return "correct";
      if (choiceId === selectedChoiceId) return "wrong";
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
    const notice = getResultNotice(result);
    return (
      <View className="flex-1">
        <StatusBar style="light" />
        <Stack align="between" width="full" className="flex-1">
          <Text variant="title-medium" className="pt-xxl">
            {`${subjectLabel ? `${subjectLabel} ` : ""}학습 테스트를\n완료했어요!`}
          </Text>
          <Stack gap="xl" width="full" className="items-center">
            <ScoreCircle correct={result.correctCount} total={result.totalCount} />
            {notice && <Text variant="base-medium" color="secondary" className="text-center">{notice}</Text>}
          </Stack>
          <Button variant="primary" onPress={goFeedback}>다음</Button>
        </Stack>
      </View>
    );
  }

  // 틀리면 서버가 준 틀린 이유, 맞으면 정답 안내
  // 풀이 보기에서는 자세한 풀이, 풀 때는 틀린 이유
  const bubbleText = reviewResult
    ? reviewResult.explanation || `정답은 ${reviewResult.correctChoiceText}입니다.`
    : currentGrade
      ? currentGrade.explanation || (currentGrade.isCorrect ? "정답이에요!" : currentGrade.reason ?? "아쉽지만 오답이에요.")
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
              {/* 퀴즈가 없으면 서버가 이때 AI로 만들어 몇 초 걸림 */}
              <Text color="secondary" className="text-center">{"퀴즈를 만들고 있어요\n잠시만 기다려주세요"}</Text>
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
                      onPress={currentGrade || reviewResult ? undefined : () => handleSelect(choice.id)}
                    />
                  ))}
                </Stack>
              </Stack>
            </ScrollView>
          )}
        </Stack>

        <Stack gap="xl" width="full" className="pt-l">
          {bubbleText && <ExplanationBubble text={bubbleText} />}
          {error && current ? <Text variant="base-small" className="text-utility-error-primary">{error}</Text> : null}
          {loading ? null : !current && error && phase === "answering" ? (
            <Button variant="primary" onPress={handleStart}>다시 시도</Button>
          ) : !current ? (
            <Button variant="primary" onPress={() => router.back()}>확인</Button>
          ) : phase === "review" ? (
            <Button variant="primary" onPress={handleReviewNext}>{isLast ? "점수 보기" : "다음"}</Button>
          ) : currentGrade ? (
            <Button variant={checking ? "disabled" : "primary"} onPress={handleNext}>{checking ? "채점 중..." : "다음"}</Button>
          ) : (
            <Button variant={selectedChoiceId === undefined || checking ? "disabled" : "primary"} onPress={handleConfirm}>
              {checking ? "채점 중..." : "확인"}
            </Button>
          )}
        </Stack>
      </Stack>
    </View>
  );
}
