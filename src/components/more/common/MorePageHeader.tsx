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
}

/**
 * 더보기 하위 화면의 맨 위 줄 (뒤로가기 + 제목)
 * @param title 화면 제목
 */
export function MorePageHeader({ title }: Props) {
  return (
    <Row gap="s" className="items-center pt-spacing-4 pb-spacing-7">
      <Pressable onPress={() => router.back()}>
        <Icon name="chevronLeft" size={28} />
      </Pressable>
      <Text variant="header-large">{title}</Text>
    </Row>
  );
}
