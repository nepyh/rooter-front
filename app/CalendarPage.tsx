import { useState } from "react";
import { Pressable, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, NavBar } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";

// ================================
// Types
// ================================

interface CalendarEvent {
  label: string;
  category: Category;
}

interface CalendarCellData {
  date: Date;
  inMonth: boolean;
}

// ================================
// Helpers
// ================================

const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const buildMockEvents = (reference: Date): Record<string, CalendarEvent[]> => {
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const thirteenth = new Date(reference.getFullYear(), reference.getMonth(), 13);
  return {
    [dateKey(today)]: [{ label: "기말고사", category: "neutral" }, { label: "두줄", category: "social" }],
    [dateKey(thirteenth)]: [{ label: "방학식", category: "neutral" }],
  };
};

const buildMonthGrid = (year: number, month: number): CalendarCellData[] => {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCellData[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - startWeekday + 1 + i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  for (let day = 1; cells.length < 42; day++) {
    cells.push({ date: new Date(year, month + 1, day), inMonth: false });
  }
  return cells;
};

// ================================
// Components
// ================================

function CalendarCell({ cell, events, selected, onPress }: { cell: CalendarCellData; events: CalendarEvent[]; selected: boolean; onPress: () => void }) {
  const dayColor = selected ? "text-white" : cell.inMonth ? "text-white" : "text-text-disabled";

  return (
    <Pressable onPress={onPress} style={{ width: `${100 / 7}%` }} className="items-center py-m">
      <View className={`items-center justify-center ${selected ? "bg-primary-500 rounded-full" : ""}`} style={{ width: 28, height: 28 }}>
        <Text variant="base-medium" className={dayColor}>{cell.date.getDate()}</Text>
      </View>
      <Stack gap="xxs" align="center" className="items-center mt-xs w-full">
        {events.slice(0, 2).map((event, i) => {
          const colors = CATEGORY_COLORS[event.category];
          return (
            <Row key={i} gap="xs" className="items-center rounded-xxs px-xxs" style={{ backgroundColor: colors.bg, maxWidth: 48 }}>
              <View className="w-[2px] h-[10px] rounded-full" style={{ backgroundColor: colors.bar }} />
              <Text variant="base-caption" className="text-white" numberOfLines={1}>{event.label}</Text>
            </Row>
          );
        })}
      </Stack>
    </Pressable>
  );
}

/**
 * 캘린더 화면
 * @description 월별 달력으로 일정을 보여주고, 날짜를 선택하거나 월을 이동할 수 있습니다.
 */
export default function CalendarPage() {
  const [now] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [events] = useState(() => buildMockEvents(now));

  const cells = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());

  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" align="between" className="items-center pb-l">
        <Text variant="header-large">{`${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}</Text>
        <Row gap="xs" className="items-center">
          <Pressable onPress={goPrevMonth} className="p-xs rounded-full">
            <Icon name="chevronLeft" size={24} />
          </Pressable>
          <Pressable onPress={goNextMonth} className="p-xs rounded-full">
            <Icon name="chevronRight" size={24} />
          </Pressable>
        </Row>
      </Row>

      <Row width="full" className="border-b border-neutral-600 pb-s">
        {WEEKDAYS.map((weekday) => (
          <View key={weekday} style={{ width: `${100 / 7}%` }} className="items-center py-s">
            <Text variant="base-medium" className="text-white">{weekday}</Text>
          </View>
        ))}
      </Row>

      <Row width="full" className="flex-wrap">
        {cells.map((cell, i) => (
          <CalendarCell
            key={i}
            cell={cell}
            events={events[dateKey(cell.date)] ?? []}
            selected={isSameDay(cell.date, selectedDate)}
            onPress={() => setSelectedDate(cell.date)}
          />
        ))}
      </Row>

      <NavBar />
    </View>
  );
}
