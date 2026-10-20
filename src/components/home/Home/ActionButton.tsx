import { Pressable } from "react-native";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  icon: IconName;
  label: string;
  onPress: () => void;
}

/**
 * 계획 액션 메뉴의 버튼 하나 (아이콘 + 글자)
 * @param icon 아이콘 이름
 * @param label 버튼 글자
 * @param onPress 눌렀을 때 호출
 */
export function ActionButton({ icon, label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="w-[54px] items-center justify-center gap-spacing-2 p-spacing-3 rounded-radius-3">
      <Icon name={icon} size={20} color={color.neutral["0"]} />
      <Text variant="base-caption" className="text-text-primary">{label}</Text>
    </Pressable>
  );
}
