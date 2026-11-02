import { Pressable, PressableProps } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props extends PressableProps {
  minutes: number;
  className?: string;
}

/**
 * 할일 알림을 몇 분 전에 받을지 보여주는 칩. 누르면 고르는 시트를 엶
 * @param minutes 할일 시작 몇 분 전
 */
export function LeadMinutesChip({ minutes, className = "", ...props }: Props) {
  return (
    <Pressable className={`px-spacing-4 py-spacing-3 rounded-radius-full bg-neutral-600 ${className}`} {...props}>
      <Text variant="base-small">{minutes}분</Text>
    </Pressable>
  );
}
