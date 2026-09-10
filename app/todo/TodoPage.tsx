import { useEffect, useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";
import { useNow } from "@/hooks/useNow";
import { useTodoStore } from "@/store";
import type { TodoGroup, TodoItem } from "@/store";

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

function TodoItemRow({ item, barColor, onPress }: { item: TodoItem; barColor: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (item.done) {
      scale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    }
  }, [item.done, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onPress}>
      <Row gap="s" className="items-center">
        <Animated.View
          className="w-[14px] h-[14px] rounded-xxs items-center justify-center"
          style={[item.done ? { backgroundColor: barColor } : { borderWidth: 1, borderColor: "#8A919E" }, boxStyle]}
        >
          {item.done && <Icon name="check" size={8} color="#FFFFFF" />}
        </Animated.View>
        <Text
          variant="base-medium"
          color={item.done ? "disabled" : "primary"}
          style={item.done ? { textDecorationLine: "line-through" } : undefined}
        >
          {item.text}
        </Text>
      </Row>
    </Pressable>
  );
}

function TodoGroupCard({ group, onToggle }: { group: TodoGroup; onToggle: (groupId: string, itemId: string) => void }) {
  const colors = CATEGORY_COLORS[group.category];

  return (
    <Row gap="s" className="bg-neutral-700 p-xs rounded-xs w-full">
      <View className="w-1 rounded-full" style={{ backgroundColor: colors.bar }} />
      <Stack gap="s" className="flex-1 p-s">
        <Text variant="base-medium" weight="medium" className="text-white">{group.title}</Text>
        <Stack gap="m">
          {group.items.map((item) => (
            <TodoItemRow key={item.id} item={item} barColor={colors.bar} onPress={() => onToggle(group.id, item.id)} />
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
  const groups = useTodoStore((state) => state.groups);
  const toggleItem = useTodoStore((state) => state.toggleItem);
  const weekDates = getWeekDates(now);

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
            <TodoGroupCard key={group.id} group={group} onToggle={toggleItem} />
          ))}
        </Stack>
      </ScrollView>

      <View className="absolute self-center items-center" style={{ bottom: 96 }}>
        <Pressable onPress={() => router.push("/AddTodo")} className="bg-neutral-700 p-m rounded-full items-center justify-center">
          <Icon name="plus" size={20} />
        </Pressable>
      </View>
    </View>
  );
}
