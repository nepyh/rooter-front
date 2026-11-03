import { Pressable, PressableProps } from "react-native";
import { Text } from "../ui/Text";

// ================================
// Components
// ================================

interface Props extends PressableProps {
  className?: string;
}

/**
 * 오늘이 아닌 날짜를 보고 있을 때 오늘로 돌아가는 [오늘로] 버튼
 * @param className 덧붙일 스타일
 */
export function TodayButton({ className = "", ...props }: Props) {
  return (
    <Pressable
      hitSlop={8}
      className={`flex-row items-center gap-spacing-2 px-spacing-3 py-spacing-2 rounded-radius-2 bg-neutral-500/15 border border-neutral-500/40 active:bg-neutral-500/30 ${className}`}
      {...props}
    >
      <Text variant="base-small">오늘로</Text>
    </Pressable>
  );
}
