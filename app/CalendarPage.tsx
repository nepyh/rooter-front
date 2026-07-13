import { useState } from "react";
import { Pressable, View } from "react-native";
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
  const makeDay = (day: number) => new Date(reference.getFullYear(), reference.getMonth(), day);

  return {
    [dateKey(today)]: [{ label: "기말고사", category: "neutral" }, { label: "두줄", category: "social" }],
    [dateKey(makeDay(3))]: [{ label: "수학 학원", category: "math" }],
    [dateKey(makeDay(8))]: [{ label: "영어 단어시험", category: "english" }],
    [dateKey(makeDay(13))]: [{ label: "방학식", category: "neutral" }],
    [dateKey(makeDay(19))]: [{ label: "과학 실험", category: "science" }],
    [dateKey(makeDay(24))]: [{ label: "동아리 모임", category: "social" }, { label: "사회 발표", category: "social" }],
  };
};

const buildMonthWeeks = (year: number, month: number): CalendarCellData[][] => {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: CalendarCellData[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - startWeekday + 1 + i), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  for (let day = 1; cells.length < totalCells; day++) {
    cells.push({ date: new Date(year, month + 1, day), inMonth: false });
  }

  const weeks: CalendarCellData[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

// ================================
// Components
// ================================

const CELL_HEIGHT = 120;

function CalendarCell({ cell, events, selected, onPress }: { cell: CalendarCellData; events: CalendarEvent[]; selected: boolean; onPress: () => void }) {
  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

  return (
    <Pressable onPress={onPress} style={{ flex: 1, height: CELL_HEIGHT }} className={`items-center px-m ${selected ? "py-m" : "py-l"}`}>
      {selected ? (
        <View className="items-center justify-center p-xs bg-primary-500 rounded-full">
          <Text variant="base-medium" color="primary">{cell.date.getDate()}</Text>
        </View>
      ) : (
        <Text variant="base-medium" color={isWeekend ? "disabled" : "primary"}>{cell.date.getDate()}</Text>
      )}
      <Stack gap="xxs" align="center" className="items-center mt-xs w-full">
        {events.slice(0, 2).map((event, i) => {
          const colors = CATEGORY_COLORS[event.category];
          return (
            <Row key={i} gap="xs" className="rounded-xxs p-xs" style={{ backgroundColor: colors.bg, maxWidth: 80 }}>
              <View className="w-[2px] rounded-full" style={{ backgroundColor: colors.bar }} />
              <Text variant="base-caption" color="primary" numberOfLines={1}>{event.label}</Text>
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
  const now = useNow(60_000);
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const events = buildMockEvents(now);

  const weeks = buildMonthWeeks(viewDate.getFullYear(), viewDate.getMonth());

  const goPrevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const isViewingCurrentMonth = viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth();
  const headerDay = selectedDate && selectedDate.getFullYear() === viewDate.getFullYear() && selectedDate.getMonth() === viewDate.getMonth()
    ? selectedDate.getDate()
    : now.getDate();
  const headerText = isViewingCurrentMonth
    ? `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월 ${headerDay}일`
    : `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" align="between" className="items-center pb-l">
        <Text variant="header-large">{headerText}</Text>
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
        {WEEKDAYS.map((weekday, i) => (
          <View key={weekday} className="flex-1 items-center px-m py-s">
            <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
          </View>
        ))}
      </Row>

      <Stack width="full">
        {weeks.map((week, i) => (
          <Row key={i} width="full" className={i < weeks.length - 1 ? "border-b border-neutral-600" : ""}>
            {week.map((cell, j) => (
              <CalendarCell
                key={j}
                cell={cell}
                events={events[dateKey(cell.date)] ?? []}
                selected={selectedDate ? isSameDay(cell.date, selectedDate) : isSameDay(cell.date, now)}
                onPress={() => setSelectedDate(cell.date)}
              />
            ))}
          </Row>
        ))}
      </Stack>

      <NavBar />
    </View>
  );
}
