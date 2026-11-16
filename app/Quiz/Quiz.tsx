import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, Toast, QuizTabHeader, QuizSection } from "@/components";
import type { QuizItem } from "@/api/quiz/Quiz";
import { useNow } from "@/hooks/common/useNow";
import { useQuizItems } from "@/hooks/quiz/useQuizItems";
import { TASK_NOT_STARTED_MESSAGE } from "@/constants/task";
import { toLocalDateString } from "@/utils/common/date";
import { hasTaskStarted } from "@/utils/common/time";
import { getSpacing } from "@/utils/common/token";

/**
 * 오늘 퀴즈를 진행 중·예정·완료로 나눠 보여주는 퀴즈 탭
 * 예정된(시작 시각 전) 퀴즈는 눌러도 열지 않고 안내만 띄움
 */
export default function QuizTab() {
  const now = useNow();
  const { loaded, current, upcoming, completed, isEmpty } = useQuizItems(now);
  const [showNotStartedNotice, setShowNotStartedNotice] = useState(false);

  const openQuiz = (item: QuizItem) => {
    const pressedAt = new Date();
    const date = toLocalDateString(pressedAt);
    if (item.task.status !== "DONE" && !hasTaskStarted(date, item.task.startTime, pressedAt)) {
      setShowNotStartedNotice(true);
      return;
    }
    router.push({
      pathname: "/Quiz/QuizPage",
      params: { taskId: String(item.task.id), dailyPlanId: String(item.task.dailyPlanId), category: item.category, date, startTime: item.task.startTime },
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <QuizTabHeader />

      {loaded && isEmpty ? (
        <View className="flex-1 items-center justify-center pb-[120px]">
          <Text color="secondary">오늘 풀 수 있는 퀴즈가 없어요</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: getSpacing("spacing-8"), paddingBottom: 140, gap: getSpacing("spacing-11") }}>
          <QuizSection title="현재 진행 가능한 퀴즈" items={current} onPressItem={openQuiz} />
          <QuizSection title="예정된 퀴즈" items={upcoming} onPressItem={openQuiz} />
          <QuizSection title="완료한 퀴즈" items={completed} onPressItem={openQuiz} />
        </ScrollView>
      )}

      {showNotStartedNotice && <Toast text={TASK_NOT_STARTED_MESSAGE} onClose={() => setShowNotStartedNotice(false)} />}
    </View>
  );
}
