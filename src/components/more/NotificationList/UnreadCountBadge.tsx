import { View, ViewProps } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props extends ViewProps {
  count: number;
  className?: string;
}

/**
 * 알림함 제목 옆의 "안 읽은 알림 n개" 표시
 * @param count 안 읽은 알림 개수
 */
export function UnreadCountBadge({ count, className = "", ...props }: Props) {
  return (
    <View className={`px-spacing-3 py-spacing-2 rounded-radius-2 bg-neutral-700 ${className}`} {...props}>
      <Text variant="base-small" color="disabled">안 읽은 알림 {count}개</Text>
    </View>
  );
}
