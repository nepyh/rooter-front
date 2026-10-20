import { Pressable } from "react-native";
import { Text } from "../../ui/Text";

// ================================
// Types
// ================================

type State = "active" | "inactive";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "active": "bg-neutral-600",
  "inactive": "border border-neutral-600",
};

// ================================
// Components
// ================================

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

/**
 * 과목 필터 버튼 하나
 * @param label 과목 이름
 * @param active 지금 고른 과목인지
 * @param onPress 눌렀을 때 호출
 */
export function SubjectPill({ label, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className={`px-spacing-5 py-spacing-4 rounded-radius-full ${stateStyles[active ? "active" : "inactive"]}`}>
      <Text variant="base-medium" weight="medium" className="text-text-primary">{label}</Text>
    </Pressable>
  );
}
