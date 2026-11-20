import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * "2026년 10월" 제목과 이전·다음 달 버튼
 * @param year 보여줄 연도
 * @param month 보여줄 달 (0부터)
 * @param onPrev 이전 달 버튼을 눌렀을 때 호출
 * @param onNext 다음 달 버튼을 눌렀을 때 호출
 */
export function MonthNavigator({ year, month, onPrev, onNext }: Props) {
  return (
    <Row width="full" align="between" className="items-center">
      <Text variant="header-large" weight="semibold">{`${year}년 ${month + 1}월`}</Text>
      <Row gap="xs" className="items-center">
        <Pressable onPress={onPrev} className="p-spacing-2 rounded-radius-full items-center justify-center">
          <Icon name="chevronLeft" size={24} />
        </Pressable>
        <Pressable onPress={onNext} className="p-spacing-2 rounded-radius-full items-center justify-center">
          <Icon name="chevronRight" size={24} />
        </Pressable>
      </Row>
    </Row>
  );
}
