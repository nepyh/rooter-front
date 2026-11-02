import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  title: string;
  accessory?: ReactNode;
  right?: ReactNode;
}

/**
 * 더보기 하위 화면의 맨 위 줄 (뒤로가기 + 제목)
 * @param title 화면 제목
 * @param accessory 제목 바로 옆에 붙는 요소
 * @param right 줄 오른쪽 끝에 붙는 요소
 */
export function MorePageHeader({ title, accessory, right }: Props) {
  return (
    <Row width="full" align="between" className="items-center pt-spacing-4 pb-spacing-7">
      <Row gap="m" className="items-center">
        <Row gap="s" className="items-center">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevronLeft" size={28} />
          </Pressable>
          <Text variant="header-large">{title}</Text>
        </Row>
        {accessory}
      </Row>
      {right}
    </Row>
  );
}
