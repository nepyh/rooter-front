import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Text } from "@/components";
import { CATEGORY_COLORS, SUBJECT_CATEGORIES } from "@/constants/category";
import type { Category } from "@/constants/category";
import { useNow } from "@/hooks/useNow";
import { toLocalDateString } from "@/utils/date";
import { getBoardDaily, getDailyTasks, getPlanBoards, getPlanBoardSubjects } from "@/api/planBoard";
import type { PlanTask } from "@/api/planBoard";

// ================================
// Types
// ================================

interface QuizItem {
  task: PlanTask;
  subjectName: string;
  category: Category;
}

// ================================
// Helpers
// ================================

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// 할일 응답에 과목이 없어 AI 계획 보드별 그날 dailyPlanId로 과목을 연결, 과목이 여럿이면 이름 없이
const loadQuizItems = async (date: string): Promise<QuizItem[]> => {
  const [daily, boards] = await Promise.all([getDailyTasks(date), getPlanBoards()]);
  const subjectByDailyPlanId = new Map<number, string>();
  await Promise.all(
    boards
      .filter((board) => board.examDate !== null)
      .map(async (board) => {
        const [boardDaily, subjects] = await Promise.all([
          getBoardDaily(board.id, date),
          getPlanBoardSubjects(board.id).catch(() => []),
        ]);
        if (typeof boardDaily.dailyPlanId !== "number") return;
        const names = [...new Set(subjects.map((subject) => subject.subjectName))];
        subjectByDailyPlanId.set(boardDaily.dailyPlanId, names.length === 1 ? names[0] : "");
      }),
  );

  // 직접 추가한 일정은 교과서가 없어 퀴즈를 만들 수 없음
  return daily.tasks
    .filter((task) => subjectByDailyPlanId.has(task.dailyPlanId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((task) => {
      const subjectName = subjectByDailyPlanId.get(task.dailyPlanId) ?? "";
      return { task, subjectName, category: SUBJECT_CATEGORIES[subjectName] ?? "neutral" };
    });
};

// ================================
// Components
// ================================

function QuizCard({ item, onPress }: { item: QuizItem; onPress: () => void }) {
  const { task, subjectName, category } = item;
  const meta = [subjectName, `${task.startTime} - ${task.endTime}`].filter(Boolean).join(" | ");

  return (
    <Pressable onPress={onPress} className="flex-row bg-neutral-700 rounded-xs p-xs w-full" style={{ gap: 8, minHeight: 80 }}>
      <View className="w-1 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category].bar }} />
      <Stack gap="xs" className="flex-1 p-m">
        <Text
          variant="base-large"
          weight="medium"
          color={task.isCompleted ? "disabled" : "primary"}
          numberOfLines={1}
          style={task.isCompleted ? { textDecorationLine: "line-through" } : undefined}
        >
          {task.taskName}
        </Text>
        <Text variant="base-medium" color="secondary">{meta}</Text>
      </Stack>
    </Pressable>
  );
}

function QuizSection({ title, items, onPressItem }: { title: string; items: QuizItem[]; onPressItem: (item: QuizItem) => void }) {
  if (items.length === 0) return null;
  return (
    <Stack gap="l" width="full">
      <Text variant="base-large" weight="medium">{title}</Text>
      <Stack gap="m" width="full">
        {items.map((item) => (
          <QuizCard key={item.task.id} item={item} onPress={() => onPressItem(item)} />
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * 오늘 퀴즈를 진행 중·예정·완료로 나눠 보여주는 퀴즈 탭
 */
export default function QuizTab() {
  const now = useNow();
  const [items, setItems] = useState<QuizItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    loadQuizItems(toLocalDateString(new Date()))
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);
  useFocusEffect(load);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const remaining = items.filter((item) => !item.task.isCompleted);
  // 지금 시간에 걸친 계획, 시작 전 계획, 완료한 계획, 끝났는데 못 한 계획은 실패라 제외
  const current = remaining.filter((item) => toMinutes(item.task.startTime) <= nowMin && nowMin < toMinutes(item.task.endTime));
  const upcoming = remaining.filter((item) => toMinutes(item.task.startTime) > nowMin);
  const completed = items.filter((item) => item.task.isCompleted);

  const openQuiz = (item: QuizItem) => {
    router.push({
      pathname: "/home/QuizPage",
      params: { taskId: String(item.task.id), dailyPlanId: String(item.task.dailyPlanId), category: item.category },
    });
  };

  const isEmpty = current.length + upcoming.length + completed.length === 0;

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <View className="-mx-6 px-6 pt-xxl pb-l border-b border-neutral-600">
        <Text variant="header-large" weight="semibold">퀴즈</Text>
      </View>

      {loaded && isEmpty ? (
        <View className="flex-1 items-center justify-center pb-[120px]">
          <Text color="secondary">오늘 풀 수 있는 퀴즈가 없어요</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 28, paddingBottom: 140, gap: 40 }}>
          <QuizSection title="현재 진행 가능한 퀴즈" items={current} onPressItem={openQuiz} />
          <QuizSection title="예정된 퀴즈" items={upcoming} onPressItem={openQuiz} />
          <QuizSection title="완료한 퀴즈" items={completed} onPressItem={openQuiz} />
        </ScrollView>
      )}
    </View>
  );
}
