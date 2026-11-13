import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Row, Stack, Text, LoadingView, WeekDateStrip, TaskList, TodayButton, type TaskRowStatus } from "@/components";
import type { PlanTask } from "@/api/common/planBoard";
import { useNow } from "@/hooks/common/useNow";
import { useWeeklyTasks } from "@/hooks/todo/useWeeklyTasks";
import { isSameDay, toLocalDateString } from "@/utils/common/date";
import { addDays, isTaskFailed, parseDateString } from "@/utils/todo/date";
import { groupTasksBySubject } from "@/utils/todo/task";
import { getSpacing } from "@/utils/common/token";

/**
 * 할 일 화면
 * 홈에서 글자를 숨긴 짧은 블록을 누르면 date 파라미터로 그 날짜를 열고, 그때만 옆으로 밀려 들어옴
 * 할 일 체크는 완료 처리 대신 퀴즈를 열고(완료는 퀴즈 통과 시 서버가 처리), 완료·실패한 할 일(실패로 저장됐거나 끝난 할 일)은 반응하지 않음
 */
export default function TodoPage() {
  const now = useNow(60_000);
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => (date ? parseDateString(date) : now));
  const centerDate = date ? parseDateString(date) : now;
  const selectedKey = toLocalDateString(selectedDate);
  const { loaded, tasks } = useWeeklyTasks(selectedKey);

  useEffect(() => {
    if (date) setSelectedDate(parseDateString(date));
  }, [date]);

  const getStatus = (task: PlanTask): TaskRowStatus => {
    if (task.status === "DONE") return "done";
    return isTaskFailed(task, selectedKey) ? "failed" : "pending";
  };

  const handleToggle = (task: PlanTask) => {
    if (getStatus(task) !== "pending") return;
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

      {!loaded ? <LoadingView className="pb-[140px]" /> : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: getSpacing("spacing-5"), paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <Stack gap="l">
            {groupTasksBySubject(tasks).map((group) => (
              <TaskList
                key={group.subjectName}
                subjectName={group.subjectName}
                category={group.category}
                tasks={group.tasks}
                getStatus={getStatus}
                onToggleTask={handleToggle}
              />
            ))}
          </Stack>
        </ScrollView>
      )}
    </Animated.View>
  );
}
