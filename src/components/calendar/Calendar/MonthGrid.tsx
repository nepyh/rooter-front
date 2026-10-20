import { View } from "react-native";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";
import { Row, Stack } from "../../layout";
import { CalendarCell } from "./CalendarCell";
import type { CalendarItem, CalendarItemsByDate } from "@/api/calendar/Calendar";
import { isSameDay, toLocalDateString, type CalendarCellData } from "@/utils/date";

// ================================
// Constants
// ================================

const SLIDE_MS = 260;

// ================================
// Components
// ================================

interface Props {
  monthKey: string;
  weeks: CalendarCellData[][];
  itemsByDate: CalendarItemsByDate;
  today: Date;
  animate: boolean;
  direction: "next" | "prev";
  onSelectItem: (date: Date, item: CalendarItem) => void;
  onSelectDay: (date: Date) => void;
}

/**
 * 한 달 날짜 칸 격자. 달을 넘기면 넘긴 방향에서 밀려 들어옴
 * @param monthKey 보고 있는 달을 구분하는 값, 바뀌면 격자를 새로 그리며 애니메이션
 * @param weeks 주 단위로 나눈 날짜 칸
 * @param itemsByDate 날짜(yyyy-MM-dd) → 그날 일정
 * @param today 오늘 날짜
 * @param animate 밀려 들어오는 애니메이션을 켤지 (처음 열 때는 끔)
 * @param direction 넘긴 방향 (next 는 오른쪽에서, prev 는 왼쪽에서 들어옴)
 * @param onSelectItem 일정을 눌렀을 때 호출
 * @param onSelectDay 날짜 칸을 눌렀을 때 호출
 */
export function MonthGrid({ monthKey, weeks, itemsByDate, today, animate, direction, onSelectItem, onSelectDay }: Props) {
  const entering = animate ? (direction === "next" ? SlideInRight : SlideInLeft).duration(SLIDE_MS) : undefined;

  return (
    <View style={{ overflow: "hidden" }}>
      <Animated.View key={monthKey} entering={entering}>
        <Stack width="full">
          {weeks.map((week, i) => (
            <Row key={i} width="full" className={i < weeks.length - 1 ? "border-b border-neutral-600" : ""}>
              {week.map((cell, j) => (
                <CalendarCell
                  key={j}
                  cell={cell}
                  items={itemsByDate[toLocalDateString(cell.date)] ?? []}
                  isToday={isSameDay(cell.date, today)}
                  onSelectItem={onSelectItem}
                  onSelectDay={onSelectDay}
                />
              ))}
            </Row>
          ))}
        </Stack>
      </Animated.View>
    </View>
  );
}
