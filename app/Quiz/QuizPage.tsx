import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Stack,
  Row,
  Text,
  Button,
  LoadingScreen,
  CenterMessage,
  QuizCloseButton,
  QuizProgressBar,
  QuizQuestionView,
  QuizIntro,
  QuizScore,
} from "@/components";
import type { Category } from "@/constants/category";
import { useTaskQuiz } from "@/hooks/quiz/useTaskQuiz";
import { useUserStore } from "@/store";
import { SUBJECT_LABELS } from "@/utils/quiz/quiz";

/**
 * 퀴즈 화면
 * 퀴즈가 없으면 서버가 AI 로 만드느라 몇 초 걸려서 전체 화면 로딩으로 기다리고, 기다리다 나가면 퀴즈 화면을 닫음
 */
export default function QuizPage() {
  const { taskId, dailyPlanId, category } = useLocalSearchParams<{ taskId?: string; dailyPlanId?: string; category?: Category }>();
  const username = useUserStore((state) => state.user?.username);
  const quiz = useTaskQuiz(taskId);
  const subjectLabel = quiz.serverSubject ?? (category ? SUBJECT_LABELS[category] : undefined);
  const { phase, current, error, checking, isLast } = quiz;

  const goFeedback = () => {
    if (!dailyPlanId) {
      router.back();
      return;
    }
    router.replace({ pathname: "/Quiz/FeedbackPage", params: { dailyPlanId } });
  };

  if (quiz.loading) return <LoadingScreen text="퀴즈 준비 중..." onBack={() => router.back()} />;

  if (phase === "intro") return <QuizIntro subjectLabel={subjectLabel} onStart={quiz.start} />;

  if (phase === "score" && quiz.result) {
    return <QuizScore result={quiz.result} username={username} subjectLabel={subjectLabel} onNext={goFeedback} />;
  }

  const locked = !!quiz.currentGrade || !!quiz.reviewResult;

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          <Row gap="l" width="full" className="items-center">
            <QuizCloseButton />
            {quiz.questions.length > 0 && <QuizProgressBar total={quiz.questions.length} current={quiz.currentIndex} />}
          </Row>

          {!current ? (
            <CenterMessage text={error || "아직 준비된 퀴즈가 없어요."} />
          ) : (
            <QuizQuestionView
              question={current}
              index={quiz.currentIndex}
              optionStateOf={quiz.optionStateOf}
              onSelect={locked ? undefined : quiz.select}
              bubbleText={quiz.bubbleText}
            />
          )}
        </Stack>

        <Stack gap="xl" width="full" className="pt-spacing-5">
          {error && current ? <Text variant="base-small" className="text-utility-error-primary">{error}</Text> : null}
          {!current && error && phase === "answering" ? (
            <Button variant="primary" onPress={quiz.start}>다시 시도</Button>
          ) : !current ? (
            <Button variant="primary" onPress={() => router.back()}>확인</Button>
          ) : phase === "review" ? (
            <Button variant="primary" onPress={quiz.reviewNext}>{isLast ? "점수 보기" : "다음"}</Button>
          ) : quiz.currentGrade ? (
            <Button variant={checking ? "disabled" : "primary"} onPress={quiz.next}>{checking ? "채점 중..." : "다음"}</Button>
          ) : (
            <Button variant={quiz.selectedChoiceId === undefined || checking ? "disabled" : "primary"} onPress={quiz.confirm}>
              {checking ? "채점 중..." : "확인"}
            </Button>
          )}
        </Stack>
      </Stack>
    </View>
  );
}
