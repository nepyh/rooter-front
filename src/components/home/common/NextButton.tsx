import { Pressable, PressableProps } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Types
// ================================

type State = "enabled" | "disabled";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "enabled": "bg-primary-500",
  "disabled": "bg-neutral-700",
};

// ================================
// Components
// ================================

interface Props extends PressableProps {
  label?: string;
  className?: string;
}

/**
 * 플랜 만들기 화면 맨 아래의 "다음" 버튼
 * @param label 버튼 글자
 * @param disabled 누를 수 없는 상태로 만들고 회색으로 표시
 */
export function NextButton({ label = "다음", disabled, className = "", ...props }: Props) {
  return (
    <Pressable
      disabled={disabled}
      className={`h-spacing-12 rounded-radius-4 items-center justify-center w-full ${stateStyles[disabled ? "disabled" : "enabled"]} ${className}`}
      {...props}
    >
      <Text variant="base-medium" weight="medium" className="text-text-primary">{label}</Text>
    </Pressable>
  );
}
