import { Pressable, View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  onPress: () => void;
}

/**
 * 할 일 목록 맨 아래 "눌러서 추가하기" 줄
 * @param onPress 눌렀을 때 호출
 */
export function AddTaskRow({ onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Row gap="s" className="items-center">
        <View className="w-[14px] h-[14px] rounded-radius-1 border border-neutral-400" />
        <Text variant="base-medium" color="disabled" style={{ textDecorationLine: "underline" }}>눌러서 추가하기</Text>
      </Row>
    </Pressable>
  );
}
