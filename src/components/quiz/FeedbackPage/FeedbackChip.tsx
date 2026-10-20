import { Pressable } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Types
// ================================

type State = "default" | "selected";

// ================================
// Styles
// ================================

const chipStyles: Record<State, string> = {
  "default": "border-neutral-600",
  "selected": "border-primary-500 bg-primary-500/30",
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
 * 피드백 보기 버튼 하나. 한 줄에 나란히 놓으면 같은 너비로 나뉨
 * @param label 보기 글
 * @param selected 고른 보기인지
 * @param onPress 눌렀을 때 호출
 */
export function FeedbackChip({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className={`flex-1 items-center justify-center p-spacing-6 rounded-radius-4 border-2 ${chipStyles[selected ? "selected" : "default"]}`}>
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}
