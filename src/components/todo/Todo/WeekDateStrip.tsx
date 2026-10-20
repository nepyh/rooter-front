import { Pressable } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/date";

// ================================
// Components
// ================================

interface Props {
  dates: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

/**
 * 요일 + 날짜로 된 일주일 날짜 줄. 고른 날짜만 밝게 표시
 * @param dates 보여줄 날짜들
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 */
export function WeekDateStrip({ dates, selectedDate, onSelect }: Props) {
  return (
    <Row width="full" className="border-b border-neutral-600 pb-spacing-3">
      {dates.map((date, i) => {
        const textColor = isSameDay(date, selectedDate) ? "primary" : "disabled";
        return (
          <Pressable key={i} onPress={() => onSelect(date)} className="flex-1 items-center py-spacing-3 rounded-radius-3">
            <Stack gap="xs" align="center" className="items-center">
              <Text variant="base-small" color={textColor}>{WEEKDAYS[date.getDay()]}</Text>
              <Text variant="base-small" weight="medium" color={textColor}>{date.getDate()}</Text>
            </Stack>
          </Pressable>
        );
      })}
    </Row>
  );
}
