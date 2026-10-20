import { Pressable, View } from "react-native";
import { Row } from "../../layout";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  onPressAdd: () => void;
  onPressAiChat: () => void;
}

/**
 * 화면 아래쪽에 떠 있는 [+] / [AI 채팅] 버튼
 * @param onPressAdd [+] 를 눌렀을 때 호출
 * @param onPressAiChat AI 채팅 버튼을 눌렀을 때 호출
 */
export function FloatingActions({ onPressAdd, onPressAiChat }: Props) {
  return (
    <View className="absolute self-center items-center" style={{ bottom: 96 }}>
      <Row gap="none" className="bg-neutral-700 border border-neutral-600 rounded-radius-full p-spacing-2 items-center">
        <Pressable onPress={onPressAdd} className="p-spacing-4 rounded-radius-full items-center justify-center">
          <Icon name="plus" size={20} />
        </Pressable>
        <Pressable onPress={onPressAiChat} className="p-spacing-4 rounded-radius-full items-center justify-center">
          <Icon name="sparkle" size={20} />
        </Pressable>
      </Row>
    </View>
  );
}
