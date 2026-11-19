import { useState } from "react";
import { Pressable, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { WEEKDAYS } from "@/constants/date";
import { color } from "@/constants/token/color";
import { buildMonthWeeks, isSameDay, toLocalDateString } from "@/utils/common/date";

// ================================
// Types
// ================================

type CellState = "selected" | "default";
type NavState = "enabled" | "disabled";

// ================================
// Styles
// ================================

const cellStyles: Record<CellState, string> = {
  "selected": "bg-primary-500",
  "default": "",
};

const navIconColors: Record<NavState, string> = {
  "enabled": color.text.primary,
  "disabled": color.text.disabled,
};

// ================================
// Helpers
// ================================

const toMonthIndex = (year: number, month: number) => year * 12 + month;

// ================================
// Components
// ================================

interface Props {
  value: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

/**
 * 월 단위로 넘겨 보며 하루를 고르는 작은 달력
 * @param value 선택된 날짜, 처음 보여줄 달도 이 날짜의 달
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param minDate 고를 수 있는 가장 이른 날짜. 이보다 이른 날짜는 회색으로 보이고 눌리지 않으며, 이 날짜의 달 이전으로는 넘길 수 없음
 */
export function CalendarGrid({ value, onSelect, minDate }: Props) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const weeks = buildMonthWeeks(viewYear, viewMonth);
  const minKey = minDate ? toLocalDateString(minDate) : null;
  const canGoPrev = !minDate || toMonthIndex(viewYear, viewMonth) > toMonthIndex(minDate.getFullYear(), minDate.getMonth());

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  };

  return (
    <Stack gap="m" width="full">
      <Row width="full" align="between" className="items-center">
        <Pressable onPress={goPrevMonth} disabled={!canGoPrev} className="w-spacing-7 h-spacing-7 items-center justify-center">
          <Icon name="chevronLeft" size={20} color={navIconColors[canGoPrev ? "enabled" : "disabled"]} />
        </Pressable>
        <Text variant="base-large" weight="medium" className="text-text-primary">{viewMonth + 1}월</Text>
        <Pressable onPress={goNextMonth} className="w-spacing-7 h-spacing-7 items-center justify-center">
          <Icon name="chevronRight" size={20} />
        </Pressable>
      </Row>
      <Stack gap="s" width="full">
        <Row width="full" className="justify-between">
          {WEEKDAYS.map((weekday) => (
            <View key={weekday} className="w-[32px] h-[32px] items-center justify-center">
              <Text variant="base-medium" color="secondary">{weekday}</Text>
            </View>
          ))}
        </Row>
        {weeks.map((week, i) => (
          <Row key={i} width="full" className="justify-between">
            {week.map((cell, j) => {
              const isSelected = isSameDay(cell.date, value);
              const isSelectable = minKey === null || toLocalDateString(cell.date) >= minKey;
              return (
                <Pressable
                  key={j}
                  onPress={() => onSelect(cell.date)}
                  disabled={!isSelectable}
                  className={`w-[32px] h-[32px] rounded-radius-full items-center justify-center ${cellStyles[isSelected ? "selected" : "default"]}`}
                >
                  <Text variant="base-medium" weight="medium" color={isSelected || (cell.inMonth && isSelectable) ? "primary" : "disabled"}>
                    {cell.date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}
