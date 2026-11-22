import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Text, Button, QuizCloseButton } from "@/components";
import { Icon } from "@/assets";
import type { Category } from "@/constants/category";
import { useNow } from "@/hooks/common/useNow";
import { formatRetryRemaining } from "@/utils/quiz/quiz";

// ================================
// Components
// ================================

/**
 * 퀴즈 재도전 대기 화면
 * 퀴즈에 떨어진 뒤 다시 풀 수 있는 시각 전에 완료를 누르면 열리고, 남은 시간을 1초마다 다시 계산해 보여줌
 * 남은 시간이 끝나면 버튼이 '퀴즈 풀기'로 바뀌고, 누르면 이 화면을 퀴즈 화면으로 바꿈
 */
export default function QuizRetryWaitPage() {
  const { retryAt, ...quizParams } = useLocalSearchParams<{
    taskId?: string;
    dailyPlanId?: string;
    category?: Category;
    date?: string;
    startTime?: string;
    retryAt?: string;
  }>();
  const now = useNow(1000);
  const remainingMs = retryAt ? new Date(retryAt).getTime() - now.getTime() : 0;
  const waiting = remainingMs > 0;

  const openQuiz = () => router.replace({ pathname: "/Quiz/QuizPage", params: quizParams });

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full">
          <QuizCloseButton />
          <Stack gap="xl" width="full">
            <Icon name="mascotFace" size={100} />
            <Stack gap="m" width="full">
              <Text variant="title-medium">아직 퀴즈를 시작할 수 없어요</Text>
              <Text variant="base-large">조금 더 공부하고 시도해볼까요?</Text>
            </Stack>
          </Stack>
        </Stack>
        {waiting ? (
          <Button variant="disabled">{formatRetryRemaining(remainingMs)}</Button>
        ) : (
          <Button variant="primary" onPress={openQuiz}>퀴즈 풀기</Button>
        )}
      </Stack>
    </View>
  );
}
