import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { SlideInRight, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, LoadingView } from "@/components";
import { Icon } from "@/assets";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";
import { useNow } from "@/hooks/useNow";
import { getWeeklyTasks } from "@/api/planBoard";
import type { PlanTask, WeeklyPlan } from "@/api/planBoard";
import { getSpacing } from "@/utils/token";

// ================================
// Constants
// ================================

const EMPTY_WEEK: WeeklyPlan = { weekStart: "", weekEnd: "", days: [] };

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// yyyy-MM-dd → 그날 0시 (로컬)
const parseDateString = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getWeekDates = (center: Date) => {
  const start = new Date(center.getFullYear(), center.getMonth(), center.getDate() - 3);
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
};

// ================================
// Components
// ================================

function TaskRow({ task, onToggle }: { task: PlanTask; onToggle: () => void }) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (task.isCompleted) {
      scale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    }
  }, [task.isCompleted, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onToggle}>
      <Row gap="s" className="items-center">
        <Animated.View
          className="w-[14px] h-[14px] rounded-radius-1 items-center justify-center"
          style={[task.isCompleted ? { backgroundColor: "#F6482D" } : { borderWidth: 1, borderColor: "#8A919E" }, boxStyle]}
        >
          {task.isCompleted && <Icon name="check" size={8} color="#FFFFFF" />}
        </Animated.View>
        <Stack gap="xxs" className="flex-1">
          <Text
            variant="base-medium"
            color={task.isCompleted ? "disabled" : "primary"}
            style={task.isCompleted ? { textDecorationLine: "line-through" } : undefined}
          >
            {task.taskName}
          </Text>
          <Text variant="base-caption" color="disabled">{`${task.startTime} - ${task.endTime}`}</Text>
        </Stack>
      </Row>
    </Pressable>
  );
}

function AddTaskRow({ date }: { date: Date }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/todo/AddTodo", params: { date: toDateString(date) } })}>
      <Row gap="s" className="items-center">
        <View className="w-[14px] h-[14px] rounded-radius-1 border border-neutral-400" />
        <Text variant="base-medium" color="disabled" style={{ textDecorationLine: "underline" }}>눌러서 추가하기</Text>
      </Row>
    </Pressable>
  );
}

/**
 * 할 일 화면
 */
export default function TodoPage() {
  const now = useNow(60_000);
  // Home에서 글자를 숨긴 짧은 블록을 누르면 그 날짜로 열림
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => (date ? parseDateString(date) : now));
  const [week, setWeek] = useState<WeeklyPlan>(EMPTY_WEEK);
  // 처음 불러올 때만 불러오는 중 표시, 탭을 다시 열 때는 이전 목록을 둔 채 갱신
  const [loaded, setLoaded] = useState(false);
  const weekDates = getWeekDates(date ? parseDateString(date) : now);

  useEffect(() => {
    if (date) setSelectedDate(parseDateString(date));
  }, [date]);
  const selectedKey = toDateString(selectedDate);

  const loadWeek = useCallback(() => {
    getWeeklyTasks(selectedKey)
      .then(setWeek)
      .catch(() => setWeek(EMPTY_WEEK))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  useFocusEffect(loadWeek);

  const tasks = week.days.find((day) => day.planDate === selectedKey)?.tasks ?? [];

  // 완료는 퀴즈 통과 시 서버가 처리, 체크는 퀴즈만 열어 Home 완료 버튼과 같게
  const handleToggle = (task: PlanTask) => {
    if (task.isCompleted) return; // 완료한 할일은 반응 없음
    // 끝나는 시각이 지난 할일은 실패로 보고 퀴즈 안 열기 (Home과 같은 규칙)
    const endTime = task.endTime === "24:00" ? "23:59" : task.endTime;
    if (new Date(`${selectedKey}T${endTime}:00`).getTime() <= Date.now()) return;
    router.push({ pathname: "/home/QuizPage", params: { taskId: String(task.id), dailyPlanId: String(task.dailyPlanId) } });
  };

  return (
    // Home 블록에서 넘어올 때만 옆으로 밀려 들어오는 전환, 탭 이동은 그대로
    <Animated.View entering={date ? SlideInRight.duration(300) : undefined} style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-spacing-5">
        <Text variant="header-large">할 일</Text>
      </Row>

      <Row width="full" className="border-b border-neutral-600 pb-spacing-3">
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const color = isSelected ? "primary" : "disabled";
          return (
            <Pressable key={i} onPress={() => setSelectedDate(date)} className="flex-1 items-center py-spacing-3 rounded-radius-3">
              <Stack gap="xs" align="center" className="items-center">
                <Text variant="base-small" color={color}>{WEEKDAYS[date.getDay()]}</Text>
                <Text variant="base-small" weight="medium" color={color}>{date.getDate()}</Text>
              </Stack>
            </Pressable>
          );
        })}
      </Row>

      {!loaded ? <LoadingView className="pb-[140px]" /> : (
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: getSpacing("spacing-5"), paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Row gap="s" className="bg-neutral-700 p-spacing-2 rounded-radius-2 w-full">
          <View className="w-spacing-2 rounded-radius-full bg-primary-500" />
          <Stack gap="m" className="flex-1 p-spacing-3">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />
            ))}
            <AddTaskRow date={selectedDate} />
          </Stack>
        </Row>
      </ScrollView>
      )}

    </Animated.View>
  );
}
