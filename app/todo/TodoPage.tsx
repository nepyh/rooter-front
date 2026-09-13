import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";
import { useNow } from "@/hooks/useNow";
import { completeTask, getWeeklyTasks } from "@/api/planBoard";
import type { PlanTask, WeeklyPlan } from "@/api/planBoard";

// ================================
// Constants
// ================================

const EMPTY_WEEK: WeeklyPlan = { weekStart: "", weekEnd: "", days: [] };

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

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
          className="w-[14px] h-[14px] rounded-xxs items-center justify-center"
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
        <View className="w-[14px] h-[14px] rounded-xxs border border-neutral-400" />
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
  const [selectedDate, setSelectedDate] = useState(now);
  const [week, setWeek] = useState<WeeklyPlan>(EMPTY_WEEK);
  const weekDates = getWeekDates(now);
  const selectedKey = toDateString(selectedDate);

  const loadWeek = useCallback(() => {
    getWeeklyTasks(selectedKey)
      .then(setWeek)
      .catch(() => setWeek(EMPTY_WEEK));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  useFocusEffect(loadWeek);

  const tasks = week.days.find((day) => day.planDate === selectedKey)?.tasks ?? [];

  const handleToggle = (task: PlanTask) => {
    const nextCompleted = !task.isCompleted;
    const applyLocal = (isCompleted: boolean) => {
      setWeek((prev) => ({
        ...prev,
        days: prev.days.map((day) => day.planDate !== selectedKey ? day : {
          ...day,
          tasks: day.tasks.map((t) => t.id === task.id ? { ...t, isCompleted } : t),
        }),
      }));
    };

    applyLocal(nextCompleted);
    completeTask(task.id, nextCompleted).catch(() => {
      applyLocal(task.isCompleted); // 실패 시 이전 상태로 되돌림
      Alert.alert("처리 실패", "완료 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-l">
        <Text variant="header-large">할 일</Text>
      </Row>

      <Row width="full" className="border-b border-neutral-600 pb-s">
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const color = isSelected ? "primary" : "disabled";
          return (
            <Pressable key={i} onPress={() => setSelectedDate(date)} className="flex-1 items-center py-s rounded-sm">
              <Stack gap="xs" align="center" className="items-center">
                <Text variant="base-small" color={color}>{WEEKDAYS[date.getDay()]}</Text>
                <Text variant="base-small" weight="medium" color={color}>{date.getDate()}</Text>
              </Stack>
            </Pressable>
          );
        })}
      </Row>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Row gap="s" className="bg-neutral-700 p-xs rounded-xs w-full">
          <View className="w-1 rounded-full bg-primary-500" />
          <Stack gap="m" className="flex-1 p-s">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => handleToggle(task)} />
            ))}
            <AddTaskRow date={selectedDate} />
          </Stack>
        </Row>
      </ScrollView>
    </View>
  );
}
