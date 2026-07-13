import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, NavBar } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";
import { useNow } from "@/hooks/useNow";

// ================================
// Types
// ================================

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TodoGroup {
  id: string;
  title: string;
  category: Category;
  items: TodoItem[];
}

// ================================
// Constants
// ================================

const INITIAL_GROUPS: TodoGroup[] = [
  {
    id: "math",
    title: "수학",
    category: "math",
    items: [
      { id: "math-1", text: "교과서 풀기", done: false },
      { id: "math-2", text: "문제집 풀기", done: true },
    ],
  },
  {
    id: "english",
    title: "영어",
    category: "english",
    items: [
      { id: "english-1", text: "단어 외우기", done: false },
      { id: "english-2", text: "기출 풀기", done: false },
      { id: "english-3", text: "본문 외우기", done: false },
      { id: "english-4", text: "문제집 풀기", done: true },
      { id: "english-5", text: "교과서 풀기", done: true },
    ],
  },
  {
    id: "social",
    title: "사회",
    category: "social",
    items: [
      { id: "social-1", text: "잠자기", done: false },
    ],
  },
];

// ================================
// Helpers
// ================================

const getWeekDates = (center: Date) => {
  const start = new Date(center.getFullYear(), center.getMonth(), center.getDate() - 3);
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
};

// ================================
// Components
// ================================

function TodoGroupCard({ group, onToggle }: { group: TodoGroup; onToggle: (groupId: string, itemId: string) => void }) {
  const colors = CATEGORY_COLORS[group.category];

  return (
    <Row gap="s" className="bg-neutral-700 p-xs rounded-xs w-full">
      <View className="w-1 rounded-full" style={{ backgroundColor: colors.bar }} />
      <Stack gap="s" className="flex-1 p-s">
        <Text variant="base-medium" weight="medium" className="text-white">{group.title}</Text>
        <Stack gap="m">
          {group.items.map((item) => (
            <Pressable key={item.id} onPress={() => onToggle(group.id, item.id)}>
              <Row gap="s" className="items-center">
                <View
                  className="w-[14px] h-[14px] rounded-xxs items-center justify-center"
                  style={item.done ? { backgroundColor: colors.bar } : { borderWidth: 1, borderColor: "#8A919E" }}
                >
                  {item.done && <Icon name="check" size={8} color="#FFFFFF" />}
                </View>
                <Text
                  variant="base-medium"
                  color={item.done ? "disabled" : "primary"}
                  style={item.done ? { textDecorationLine: "line-through" } : undefined}
                >
                  {item.text}
                </Text>
              </Row>
            </Pressable>
          ))}
        </Stack>
      </Stack>
    </Row>
  );
}

/**
 * 할 일 화면
 * @description 이번 주 요일을 보여주고, 과목별 할 일 목록을 체크할 수 있습니다.
 */
export default function TodoPage() {
  const now = useNow(60_000);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const weekDates = getWeekDates(now);

  const handleToggle = (groupId: string, itemId: string) => {
    setGroups((prev) => prev.map((group) => (
      group.id !== groupId ? group : {
        ...group,
        items: group.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
      }
    )));
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-l">
        <Text variant="header-large">할 일</Text>
      </Row>

      <Row width="full" className="border-b border-neutral-600 pb-s">
        {weekDates.map((date, i) => {
          const color = isSameDay(date, now) ? "primary" : "disabled";
          return (
            <View key={i} className="flex-1 items-center py-s rounded-sm">
              <Stack gap="xs" align="center" className="items-center">
                <Text variant="base-small" color={color}>{WEEKDAYS[date.getDay()]}</Text>
                <Text variant="base-small" weight="medium" color={color}>{date.getDate()}</Text>
              </Stack>
            </View>
          );
        })}
      </Row>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Stack gap="l" width="full">
          {groups.map((group) => (
            <TodoGroupCard key={group.id} group={group} onToggle={handleToggle} />
          ))}
        </Stack>
      </ScrollView>

      <View className="absolute self-center items-center" style={{ bottom: 96 }}>
        <Pressable className="bg-neutral-700 p-m rounded-full items-center justify-center">
          <Icon name="plus" size={20} />
        </Pressable>
      </View>

      <NavBar />
    </View>
  );
}
