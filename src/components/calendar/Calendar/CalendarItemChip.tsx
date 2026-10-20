import { Pressable, View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { CATEGORY_COLORS } from "@/constants/category";
import type { CalendarItem } from "@/api/calendar/Calendar";

// ================================
// Components
// ================================

interface Props {
  item: CalendarItem;
  onPress: () => void;
}

/**
 * 날짜 칸 안에 들어가는 일정 한 줄 (과목 색 막대 + 제목)
 * @param item 보여줄 일정
 * @param onPress 눌렀을 때 호출
 */
export function CalendarItemChip({ item, onPress }: Props) {
  const colors = CATEGORY_COLORS[item.category];

  return (
    <Pressable onPress={onPress}>
      <Row gap="xs" className="items-center rounded-radius-1 p-spacing-2 w-full" style={{ backgroundColor: colors.bg }}>
        <View className="w-[2px] self-stretch rounded-radius-full" style={{ backgroundColor: colors.bar }} />
        <Text variant="base-caption" color="primary" numberOfLines={1} style={{ flexShrink: 1 }}>{item.label}</Text>
      </Row>
    </Pressable>
  );
}
