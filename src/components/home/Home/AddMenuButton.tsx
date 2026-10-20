import { Pressable } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  label: string;
  onPress?: () => void;
}

/**
 * [+] 메뉴 안의 버튼 하나
 * @param label 버튼 글자
 * @param onPress 눌렀을 때 호출
 */
export function AddMenuButton({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-700 h-spacing-12 rounded-radius-4 items-center justify-center w-full">
      <Text variant="base-medium" weight="medium">{label}</Text>
    </Pressable>
  );
}
