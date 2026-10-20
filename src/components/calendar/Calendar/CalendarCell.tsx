import { Pressable, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { CalendarItemChip } from "./CalendarItemChip";
import type { CalendarItem } from "@/api/calendar/Calendar";
import type { CalendarCellData } from "@/utils/common/date";

// ================================
// Components
// ================================

interface Props {
  cell: CalendarCellData;
  items: CalendarItem[];
  isToday: boolean;
  onSelectItem: (date: Date, item: CalendarItem) => void;
  onSelectDay: (date: Date) => void;
}

/**
 * 캘린더 날짜 한 칸. 날짜 숫자와 그날 일정 목록을 보여줌. 오늘은 주황 원, 다른 달·주말은 흐리게 표시
 * @param cell 날짜와 이번 달 여부
 * @param items 그날 일정
 * @param isToday 오늘인지
 * @param onSelectItem 일정을 눌렀을 때 호출
 * @param onSelectDay 칸의 빈 곳을 눌렀을 때 호출
 */
export function CalendarCell({ cell, items, isToday, onSelectItem, onSelectDay }: Props) {
  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
  const dimmed = !cell.inMonth || isWeekend;

  return (
    <Pressable onPress={() => onSelectDay(cell.date)} style={{ flex: 1, minHeight: 72 }} className="items-center px-spacing-2 py-spacing-4">
      <View style={{ height: 28 }} className="items-center justify-center">
        {isToday ? (
          <View className="items-center justify-center w-[28px] h-[28px] bg-primary-500 rounded-radius-full">
            <Text variant="base-medium" color="primary">{cell.date.getDate()}</Text>
          </View>
        ) : (
          <Text variant="base-medium" color={dimmed ? "disabled" : "primary"}>{cell.date.getDate()}</Text>
        )}
      </View>
      {items.length > 0 && (
        <Stack gap="xxs" width="full" className="mt-spacing-3">
          {items.map((item, i) => (
            <CalendarItemChip key={i} item={item} onPress={() => onSelectItem(cell.date, item)} />
          ))}
        </Stack>
      )}
    </Pressable>
  );
}
