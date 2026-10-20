import { View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { WEEKDAYS } from "@/constants/date";

// ================================
// Components
// ================================

/**
 * 일~토 요일 줄. 주말은 흐리게 표시
 */
export function WeekdayHeader() {
  return (
    <Row width="full" className="border-b border-neutral-600 pb-spacing-3">
      {WEEKDAYS.map((weekday, i) => (
        <View key={weekday} className="flex-1 items-center px-spacing-4 py-spacing-3">
          <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
        </View>
      ))}
    </Row>
  );
}
