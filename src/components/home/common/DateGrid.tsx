import { Pressable, View, type ViewStyle } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { buildMonthWeeks, toLocalDateString } from "@/utils/common/date";
import { WEEKDAYS } from "@/constants/date";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type CellState = "selected" | "inRange" | "default";

// ================================
// Constants
// ================================

// 한 주(줄)의 최대 높이. 화면이 작아 다 안 들어가면 남은 높이를 주 수로 나눠 줄임 (#354)
const WEEK_ROW_MAX_HEIGHT = 87;

// ================================
// Styles
// ================================

const cellStyles: Record<CellState, ViewStyle> = {
  "selected": { borderWidth: 2, borderColor: color.primary["500"], backgroundColor: `${color.primary["500"]}4D` },
  "inRange": { backgroundColor: `${color.primary["500"]}1A` },
  "default": {},
};

// ================================
// Helpers
// ================================

const getCellState = (dateString: string, selectedString: string | null, rangeStartString: string | null): CellState => {
  if (dateString === selectedString || dateString === rangeStartString) return "selected";
  if (rangeStartString !== null && selectedString !== null && rangeStartString < dateString && dateString < selectedString) return "inRange";
  return "default";
};

// ================================
// Components
// ================================

interface Props {
  viewYear: number;
  viewMonth: number;
  today: Date;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  rangeStart?: Date;
  className?: string;
}

/**
 * 시험 날짜를 고르는 한 달 달력. 오늘은 주황 원, 고른 날은 주황 테두리로 표시하고 고를 수 있는 가장 이른 날짜보다 이른 날은 고를 수 없음
 * @param viewYear 보여줄 연도
 * @param viewMonth 보여줄 달 (0부터)
 * @param today 오늘 날짜
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param minDate 고를 수 있는 가장 이른 날짜, 생략하면 오늘·지난 날짜를 뺀 내일부터
 * @param maxDate 고를 수 있는 가장 늦은 날짜, 생략하면 제한 없음
 * @param rangeStart 기간의 시작일. 주면 이 날도 주황 테두리로 표시하고, 고른 날까지의 사이 날짜를 옅은 주황으로 칠함
 * @param className 바깥 Stack 에 덧붙일 클래스. flex-1 을 주면 주는 그 높이 안에 맞춰 줄어듦 (한 주 최대 87)
 */
export function DateGrid({ viewYear, viewMonth, today, selectedDate, onSelect, minDate, maxDate, rangeStart, className = "" }: Props) {
  const weeks = buildMonthWeeks(viewYear, viewMonth);
  const todayString = toLocalDateString(today);
  const selectedString = selectedDate ? toLocalDateString(selectedDate) : null;
  const minString = minDate ? toLocalDateString(minDate) : null;
  const maxString = maxDate ? toLocalDateString(maxDate) : null;
  const rangeStartString = rangeStart ? toLocalDateString(rangeStart) : null;

  return (
    <Stack width="full" className={className}>
      <Row width="full" className="border-b border-neutral-600 justify-center">
        {WEEKDAYS.map((weekday, i) => (
          <View key={weekday} className="flex-1 items-center px-spacing-4 py-spacing-3">
            <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
          </View>
        ))}
      </Row>
      {weeks.map((week, i) => (
        <Row key={i} width="full" className={`justify-center ${i < weeks.length - 1 ? "border-b border-neutral-600" : ""}`} style={{ flex: 1, maxHeight: WEEK_ROW_MAX_HEIGHT }}>
          {week.map((cell, j) => {
            const dateString = toLocalDateString(cell.date);
            const isToday = dateString === todayString;
            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
            const isSelectable = (minString === null ? dateString > todayString : dateString >= minString) && (maxString === null || dateString <= maxString);
            return (
              <Pressable
                key={j}
                onPress={() => onSelect(cell.date)}
                disabled={!isSelectable}
                className="flex-1 items-center rounded-radius-3 px-spacing-2 pt-spacing-5"
                style={cellStyles[getCellState(dateString, selectedString, rangeStartString)]}
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
