import { Pressable, View, type TextStyle } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Styles
// ================================

// Text 가 color 클래스를 항상 붙여서 className 으로는 글자색이 바뀌지 않아 style 로 지정
const actionStyle: TextStyle = { color: color.primary["500"], textDecorationLine: "underline" };

// ================================
// Components
// ================================

interface Props {
  message: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
}

/**
 * 홈 타임라인 위에 뜨는 마스코트 안내 말풍선 (계획 없음 안내, 오늘 공부 설문 안내)
 * @param message 말풍선 본문
 * @param actionLabel 본문 아래 밑줄 버튼 글자
 * @param onAction 밑줄 버튼을 눌렀을 때 호출
 * @param onClose 닫기 버튼을 눌렀을 때 호출
 */
export function MascotNotice({ message, actionLabel, onAction, onClose }: Props) {
  return (
    <View className="absolute z-10" style={{ top: getSpacing("spacing-5"), left: -getSpacing("spacing-4"), right: -getSpacing("spacing-4") }}>
      <Row gap="m" width="full" className="items-start">
        <Icon name="mascotFace" size={52} />
        <Stack gap="xs" className="flex-1 bg-neutral-700 px-spacing-5 py-spacing-4 rounded-tr-radius-5 rounded-br-radius-5 rounded-bl-radius-5">
          <Text variant="base-medium">{message}</Text>
          <Pressable onPress={onAction}>
            <Text variant="base-medium" style={actionStyle}>{actionLabel}</Text>
          </Pressable>
        </Stack>
      </Row>
      <Pressable
        onPress={onClose}
        hitSlop={10}
        className="absolute w-[20px] h-[20px] rounded-radius-full bg-neutral-600 items-center justify-center"
        style={{ top: -getSpacing("spacing-2"), right: -getSpacing("spacing-2") }}
      >
        <Icon name="close" size={12} />
      </Pressable>
    </View>
  );
}
