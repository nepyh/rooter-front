import { View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  text: string;
}

/**
 * 오른쪽 마스코트가 말하는 말풍선. 마스코트 쪽 아래 모서리만 각지게 그림
 * @param text 말풍선 문구
 */
export function MascotBubble({ text }: Props) {
  return (
    <Row gap="m" width="full" className="items-end">
      <View className="flex-1 bg-neutral-700 px-spacing-6 py-spacing-5 rounded-tl-radius-5 rounded-tr-radius-5 rounded-bl-radius-5">
        <Text variant="base-large">{text}</Text>
      </View>
      <Icon name="mascotFace" size={52} />
    </Row>
  );
}
