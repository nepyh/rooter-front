import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  title: string;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * 캘린더 맨 위 줄. 보고 있는 달 제목과 이전·다음 달 버튼
 * @param title 제목 (예: 2026년 10월 21일)
 * @param onPrev 이전 달 버튼을 눌렀을 때 호출
 * @param onNext 다음 달 버튼을 눌렀을 때 호출
 */
export function CalendarHeader({ title, onPrev, onNext }: Props) {
  return (
    <Row width="full" align="between" className="items-center pb-spacing-5">
      <Text variant="header-large">{title}</Text>
      <Row gap="xs" className="items-center">
        <Pressable onPress={onPrev} className="p-spacing-2 rounded-radius-full">
          <Icon name="chevronLeft" size={24} />
        </Pressable>
        <Pressable onPress={onNext} className="p-spacing-2 rounded-radius-full">
          <Icon name="chevronRight" size={24} />
        </Pressable>
      </Row>
    </Row>
  );
}
