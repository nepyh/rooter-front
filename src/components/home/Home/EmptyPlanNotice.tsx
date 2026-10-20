import { Pressable, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { getSpacing } from "@/utils/common/token";

// ================================
// Components
// ================================

interface Props {
  onCreate: () => void;
  onClose: () => void;
}

/**
 * 계획이 없을 때 타임라인 위에 뜨는 마스코트 안내 말풍선
 * @param onCreate "새 플랜 생성하기" 를 눌렀을 때 호출
 * @param onClose 닫기 버튼을 눌렀을 때 호출
 */
export function EmptyPlanNotice({ onCreate, onClose }: Props) {
  return (
    <View className="absolute z-10" style={{ top: getSpacing("spacing-5"), left: -getSpacing("spacing-4"), right: -getSpacing("spacing-4") }}>
      <Row gap="m" width="full" className="items-start">
        <Icon name="mascotFace" size={52} />
        <Stack gap="xs" className="flex-1 bg-neutral-700 px-spacing-5 py-spacing-4 rounded-tr-radius-5 rounded-br-radius-5 rounded-bl-radius-5">
          <Text variant="base-medium">생성된 플랜이 없어요. 플랜을 만들어 하루 계획을 생성해보세요!</Text>
          <Pressable onPress={onCreate}>
            <Text variant="base-medium" className="text-primary-500" style={{ textDecorationLine: "underline" }}>새 플랜 생성하기</Text>
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
