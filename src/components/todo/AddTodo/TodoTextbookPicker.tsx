import { Pressable, View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { TextbookPicker } from "../../home/Home/TextbookPicker";
import type { TextbookWithSubject } from "../../home/Home/TextbookPicker";

// ================================
// Components
// ================================

interface Props {
  selectedId: number | null;
  onSelect: (textbook: TextbookWithSubject) => void;
  onClose: () => void;
  className?: string;
}

/**
 * 할 일 추가 화면 위에 덮어 띄우는 교과서 선택 화면. 일정 추가 모달과 같은 과목 탭 + 교과서 격자(TextbookPicker)를 씀
 * 할 일 추가 화면의 내용 영역을 그대로 덮고, 할 일에는 목차가 없어서 교과서를 누르면 바로 고르고 닫힘
 * @param selectedId 지금 고른 교과서 ID, 없으면 null
 * @param onSelect 교과서를 눌렀을 때 호출
 * @param onClose 뒤로가기를 눌렀을 때 호출
 */
export function TodoTextbookPicker({ selectedId, onSelect, onClose, className = "" }: Props) {
  const selectedIds = new Set(selectedId === null ? [] : [selectedId]);

  return (
    // 할 일 추가 화면이 이미 안전 영역·좌우 여백 안에 그려져서, 여백 없이 그 영역만 덮음
    <View className={`absolute inset-spacing-0 bg-background-primary ${className}`}>
      <Row gap="xs" className="items-center pb-spacing-6">
        <Pressable onPress={onClose} hitSlop={8}>
          <Icon name="chevronLeft" size={32} />
        </Pressable>
        <Text variant="header-medium" weight="semibold">과목 선택</Text>
      </Row>
      <TextbookPicker selectedIds={selectedIds} onToggle={onSelect} bottomInset={40} />
    </View>
  );
}
