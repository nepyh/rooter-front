import { View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_NAMES } from "@/api/user";
import type { UnavailableTime } from "@/api/user";

// ================================
// Components
// ================================

interface Props {
  item: UnavailableTime;
}

/**
 * 등록된 불가능 시간 한 줄 (요일 + 시작-종료 시간)
 * @param item 보여줄 불가능 시간
 */
export function UnavailableTimeRow({ item }: Props) {
  const dayLabel = DAY_OF_WEEK_LABELS[DAY_OF_WEEK_NAMES.indexOf(item.dayOfWeek)];

  return (
    <Row gap="m" className="items-center bg-neutral-700 p-spacing-5 rounded-radius-4 w-full">
      <View className="px-spacing-4 py-spacing-2 rounded-radius-2 bg-neutral-600">
        <Text variant="base-medium" weight="medium">{dayLabel}</Text>
      </View>
      <Text variant="base-medium">{`${item.startTime} - ${item.endTime}`}</Text>
    </Row>
  );
}
