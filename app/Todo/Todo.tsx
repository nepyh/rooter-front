import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Row, Text, LoadingView, WeekDateStrip, TaskList } from "@/components";
import type { PlanTask } from "@/api/common/planBoard";
import { useNow } from "@/hooks/common/useNow";
import { useWeeklyTasks } from "@/hooks/todo/useWeeklyTasks";
import { toLocalDateString } from "@/utils/common/date";
import { getWeekDates, isTaskEnded, parseDateString } from "@/utils/todo/date";
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
  const weekDates = getWeekDates(date ? parseDateString(date) : now);
  const selectedKey = toLocalDateString(selectedDate);
  const { loaded, tasks } = useWeeklyTasks(selectedKey);

  useEffect(() => {
    if (date) setSelectedDate(parseDateString(date));
  }, [date]);

  const handleToggle = (task: PlanTask) => {
    if (task.isCompleted || isTaskEnded(task, selectedKey)) return;
    router.push({ pathname: "/Quiz/QuizPage", params: { taskId: String(task.id), dailyPlanId: String(task.dailyPlanId) } });
  };

  const handleAdd = () => {
    router.push({ pathname: "/Todo/AddTodo", params: { date: selectedKey } });
  };

  return (
    <Animated.View entering={date ? SlideInRight.duration(300) : undefined} style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-spacing-5">
        <Text variant="header-large">할 일</Text>
      </Row>

      <WeekDateStrip dates={weekDates} selectedDate={selectedDate} onSelect={setSelectedDate} />

      {!loaded ? <LoadingView className="pb-[140px]" /> : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: getSpacing("spacing-5"), paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <TaskList tasks={tasks} onToggleTask={handleToggle} onAdd={handleAdd} />
        </ScrollView>
      )}
    </Animated.View>
  );
}
