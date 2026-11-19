import { Pressable, PressableProps } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props extends PressableProps {
  className?: string;
}

/**
 * 플랜 수정 화면 맨 아래의 [삭제하기] 카드 버튼
 * @param onPress 눌렀을 때 호출
 */
export function PlanDeleteButton({ className = "", ...props }: Props) {
  return (
    <Pressable accessibilityRole="button" className={`w-full bg-neutral-700 p-spacing-6 rounded-radius-4 ${className}`} {...props}>
      <Text variant="base-large" weight="medium" numberOfLines={1}>삭제하기</Text>
    </Pressable>
  );
}
