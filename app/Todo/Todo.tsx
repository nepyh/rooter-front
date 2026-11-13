import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Row, Stack, Text, LoadingView, WeekDateStrip, TaskList, TodayButton } from "@/components";
import type { PlanTask } from "@/api/common/planBoard";
import { useNow } from "@/hooks/common/useNow";
import { useWeeklyTasks } from "@/hooks/todo/useWeeklyTasks";
import { isSameDay, toLocalDateString } from "@/utils/common/date";
import { addDays, isTaskEnded, parseDateString } from "@/utils/todo/date";
import { groupTasksBySubject } from "@/utils/todo/task";
import { getSpacing } from "@/utils/common/token";

/**
 * 할 일 화면
 * 홈에서 글자를 숨긴 짧은 블록을 누르면 date 파라미터로 그 날짜를 열고, 그때만 옆으로 밀려 들어옴
 * 할 일 체크는 완료 처리 대신 퀴즈를 열고(완료는 퀴즈 통과 시 서버가 처리), 완료했거나 끝난 할 일은 반응하지 않음
 */
export default function TodoPage() {
  const now = useNow(60_000);
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => (date ? parseDateString(date) : now));
  const centerDate = date ? parseDateString(date) : now;
  const selectedKey = toLocalDateString(selectedDate);
  const { loaded, tasks, isError, isPlaceholder } = useWeeklyTasks(selectedKey);
  // 새 주를 불러오는 중에는 빈 목록이어도 '계획 없음'을 띄우지 않음 (주를 넘길 때 깜빡임 방지)
  const emptyMessage = isError ? "할 일을 불러오지 못했어요" : tasks.length === 0 && !isPlaceholder ? "현재 계획이 없어요" : null;
  const allFailed = tasks.length > 0 && tasks.every((task) => task.status === "FAILED" || (task.status === "PENDING" && isTaskEnded(task, selectedKey)));

  useEffect(() => {
    if (date) setSelectedDate(parseDateString(date));
  }, [date]);

  const handleToggle = (task: PlanTask) => {
    if (task.status === "DONE" || isTaskEnded(task, selectedKey)) return;
    router.push({ pathname: "/Quiz/QuizPage", params: { taskId: String(task.id), dailyPlanId: String(task.dailyPlanId) } });
  };

  return (
    <Animated.View entering={date ? SlideInRight.duration(300) : undefined} style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Row width="full" gap="m" className="items-center pb-spacing-5">
        <Text variant="header-large">할 일</Text>
        {!isSameDay(selectedDate, now) && <TodayButton onPress={() => setSelectedDate(now)} />}
      </Row>

      <WeekDateStrip
        key={toLocalDateString(centerDate)}
        centerDate={centerDate}
        today={now}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onChangeWeek={(weeks) => setSelectedDate((prev) => addDays(prev, weeks * 7))}
      />

      {!loaded ? <LoadingView className="pb-[140px]" /> : emptyMessage ? (
        <View className="flex-1 items-center justify-center pb-[140px]">
          <Text color="secondary">{emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: getSpacing("spacing-5"), paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <Stack gap="l">
            {allFailed && <Text color="secondary" className="text-center">계획을 다 실패했어요</Text>}
            {groupTasksBySubject(tasks).map((group) => (
              <TaskList
                key={group.subjectName}
                subjectName={group.subjectName}
                category={group.category}
                tasks={group.tasks}
                onToggleTask={handleToggle}
              />
            ))}
          </Stack>
        </ScrollView>
      )}
    </Animated.View>
  );
}
