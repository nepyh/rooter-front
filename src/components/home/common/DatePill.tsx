import { Pressable, PressableProps, type TextStyle } from "react-native";
import { Text } from "../../ui/Text";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type State = "active" | "inactive";

// ================================
// Styles
// ================================

const labelStyles: Record<State, TextStyle> = {
  "active": { color: color.primary["500"] },
  "inactive": { color: color.text.primary },
};

const labelWeights: Record<State, "medium" | "regular"> = {
  "active": "medium",
  "inactive": "regular",
};

// ================================
// Components
// ================================

interface Props extends PressableProps {
  label: string;
  active?: boolean;
  className?: string;
}

/**
 * 날짜·시간을 보여주고 눌러서 선택 창을 여는 둥근 버튼
 * @param label 버튼에 보여줄 날짜·시간
 * @param active 선택 창이 열려 있는지. 열려 있으면 글자를 주황색으로 표시
 */
export function DatePill({ label, active = false, className = "", ...props }: Props) {
  const state: State = active ? "active" : "inactive";

  return (
    <Pressable className={`bg-neutral-600 px-spacing-4 py-spacing-3 rounded-radius-full ${className}`} {...props}>
      <Text variant="base-small" weight={labelWeights[state]} style={labelStyles[state]}>{label}</Text>
    </Pressable>
  );
}
