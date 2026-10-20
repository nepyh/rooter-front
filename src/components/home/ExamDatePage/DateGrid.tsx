import { Pressable, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { buildMonthWeeks, toLocalDateString } from "@/utils/common/date";
import { WEEKDAYS } from "@/constants/date";
import { color } from "@/constants/token/color";

// ================================
// Styles
// ================================

const SELECTED_STYLE = { borderWidth: 2, borderColor: color.primary["500"], backgroundColor: `${color.primary["500"]}4D` };

// ================================
// Components
// ================================

interface Props {
  viewYear: number;
  viewMonth: number;
  today: Date;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

/**
 * 시험 날짜를 고르는 한 달 달력. 오늘은 주황 원, 고른 날은 주황 테두리로 표시하고 오늘·지난 날짜는 고를 수 없음
 * @param viewYear 보여줄 연도
 * @param viewMonth 보여줄 달 (0부터)
 * @param today 오늘 날짜
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 */
export function DateGrid({ viewYear, viewMonth, today, selectedDate, onSelect }: Props) {
  const weeks = buildMonthWeeks(viewYear, viewMonth);
  const todayString = toLocalDateString(today);
  const selectedString = selectedDate ? toLocalDateString(selectedDate) : null;

  return (
    <Stack width="full">
      <Row width="full" className="border-b border-neutral-600 justify-center">
        {WEEKDAYS.map((weekday, i) => (
          <View key={weekday} className="flex-1 items-center px-spacing-4 py-spacing-3">
            <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
          </View>
        ))}
      </Row>
      {weeks.map((week, i) => (
        <Row key={i} width="full" className={`justify-center ${i < weeks.length - 1 ? "border-b border-neutral-600" : ""}`} style={{ height: 87 }}>
          {week.map((cell, j) => {
            const dateString = toLocalDateString(cell.date);
            const isToday = dateString === todayString;
            const isSelected = dateString === selectedString;
            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
            const isSelectable = dateString > todayString;
            return (
              <Pressable
                key={j}
                onPress={() => onSelect(cell.date)}
                disabled={!isSelectable}
                className="flex-1 items-center rounded-radius-3 px-spacing-2 py-spacing-5"
                style={isSelected ? SELECTED_STYLE : undefined}
              >
                {isToday ? (
                  <View className="w-[28px] h-[28px] -my-spacing-2 bg-primary-500 rounded-radius-full items-center justify-center">
                    <Text variant="base-medium" color="primary" numberOfLines={1}>{cell.date.getDate()}</Text>
                  </View>
                ) : (
                  <Text variant="base-medium" color={cell.inMonth && !isWeekend && isSelectable ? "primary" : "disabled"}>{cell.date.getDate()}</Text>
                )}
              </Pressable>
            );
          })}
        </Row>
      ))}
    </Stack>
  );
}
