import { Pressable } from "react-native";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type State = "enabled" | "disabled";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "enabled": "",
  "disabled": "opacity-40",
};

// ================================
// Components
// ================================

interface Props {
  icon: IconName;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * 계획 액션 메뉴의 버튼 하나 (아이콘 + 글자)
 * @param icon 아이콘 이름
 * @param label 버튼 글자
 * @param disabled 흐리게 표시. 눌러도 onPress 는 불러서, 왜 못 쓰는지 안내할 수 있게 함
 * @param onPress 눌렀을 때 호출
 */
export function ActionButton({ icon, label, disabled = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ disabled }} className={`w-[54px] items-center justify-center gap-spacing-2 p-spacing-3 rounded-radius-3 ${stateStyles[disabled ? "disabled" : "enabled"]}`}>
      <Icon name={icon} size={20} color={color.neutral["0"]} />
      <Text variant="base-caption" className="text-text-primary">{label}</Text>
    </Pressable>
  );
}
