import { Pressable } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Types
// ================================

type State = "selected" | "unselected";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "selected": "border-primary-500 bg-primary-500/30",
  "unselected": "border-neutral-600 bg-transparent",
};

// ================================
// Components
// ================================

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * 설문 보기 하나. 고르면 주황 테두리와 배경으로 표시
 * @param label 보기 문구
 * @param selected 고른 보기인지
 * @param onPress 눌렀을 때 호출
 */
export function OptionRow({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className={`border-2 rounded-radius-4 p-spacing-6 w-full ${stateStyles[selected ? "selected" : "unselected"]}`}>
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}
