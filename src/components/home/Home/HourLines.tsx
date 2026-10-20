import { View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { HOURS } from "@/utils/home/timeline";
import { pad } from "@/utils/common/time";

// ================================
// Components
// ================================

/**
 * 타임라인의 시간 눈금(00:00 ~ 23:00)과 가로 구분선
 */
export function HourLines() {
  return (
    <>
      {HOURS.map((hour, i) => (
        <Row key={i} width="full" align="between" className="absolute items-center" style={{ top: i * 60 }}>
          <Text variant="base-caption" color="disabled">{pad(hour)}:00</Text>
          <View className="flex-1 h-spacing-divider bg-neutral-600 ml-spacing-3" />
        </Row>
      ))}
    </>
  );
}
