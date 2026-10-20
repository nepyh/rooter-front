import { Pressable } from "react-native";
import { router } from "expo-router";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

/**
 * 할 일 추가 화면 맨 위 (뒤로가기 + "할 일 추가" 제목 + 안내 문구)
 */
export function AddTodoHeader() {
  return (
    <Stack gap="s">
      <Row gap="s" className="items-center">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">할 일 추가</Text>
      </Row>
      <Text color="secondary">제목과 시간을 입력해주세요</Text>
    </Stack>
  );
}
