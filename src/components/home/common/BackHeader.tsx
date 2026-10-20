import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  onBack: () => void;
  title?: string;
  right?: ReactNode;
}

/**
 * 뒤로가기 버튼이 있는 화면 맨 위 줄
 * @param onBack 뒤로가기 버튼을 눌렀을 때 호출
 * @param title 뒤로가기 버튼 옆에 붙일 작은 제목
 * @param right 오른쪽 끝에 붙일 내용
 */
export function BackHeader({ onBack, title, right }: Props) {
  return (
    <Row width="full" align="between" className="items-center pb-spacing-5">
      <Row gap="s" className="items-center">
        <Pressable onPress={onBack}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        {title && <Text variant="header-medium" weight="semibold" color="secondary">{title}</Text>}
      </Row>
      {right}
    </Row>
  );
}
