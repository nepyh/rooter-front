import { View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  top: number;
  label: string;
}

/**
 * 타임라인 위의 현재 시각 선
 * @param top 타임라인 시작 기준 위치(분 = px)
 * @param label 선 왼쪽에 보여줄 시각 (예: 14:05)
 */
export function CurrentTimeLine({ top, label }: Props) {
  return (
    <Row style={{ position: "absolute", top: top - 9, left: 0, right: 0 }} className="items-center">
      <View className="bg-primary-500 rounded-radius-2 px-spacing-2 py-spacing-1">
        <Text variant="base-caption" weight="medium" className="text-text-primary">{label}</Text>
      </View>
      <View className="flex-1 h-[2px] bg-primary-500 rounded-r-radius-full" />
    </Row>
  );
}
