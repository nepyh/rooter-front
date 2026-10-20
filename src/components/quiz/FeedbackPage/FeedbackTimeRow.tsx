import { Pressable, View } from "react-native";
import { Text } from "../../ui/Text";
import { TimeWheelPicker } from "../../AddPlanBoardModal";
import { formatClock } from "@/utils/common/time";
import { getSpacing } from "@/utils/token";

// ================================
// Types
// ================================

type State = "active" | "inactive";

// ================================
// Styles
// ================================

const valueStyles: Record<State, string> = {
  "active": "bg-primary-500",
  "inactive": "bg-neutral-600",
};

// ================================
// Components
// ================================

interface Props {
  label: string;
  value: Date;
  active: boolean;
  onPress: () => void;
  onChange: (date: Date) => void;
}

/**
 * 시각 항목 한 줄. 누르면 아래에 시간 휠이 펼쳐짐
 * @param label 항목 이름
 * @param value 고른 시각
 * @param active 휠을 펼친 상태인지
 * @param onPress 줄을 눌렀을 때 호출
 * @param onChange 휠에서 시각이 바뀔 때 호출
 */
export function FeedbackTimeRow({ label, value, active, onPress, onChange }: Props) {
  return (
    <View className="w-full bg-neutral-700 rounded-radius-4 px-spacing-6 py-spacing-5" style={{ gap: getSpacing("spacing-5") }}>
      <Pressable onPress={onPress} className="flex-row items-center justify-between w-full" style={{ minHeight: 34 }}>
        <Text variant="base-large" weight="medium">{label}</Text>
        <View className={`px-spacing-4 py-spacing-3 rounded-radius-full ${valueStyles[active ? "active" : "inactive"]}`}>
          <Text variant="base-small">{formatClock(value)}</Text>
        </View>
      </Pressable>
      {active && <TimeWheelPicker value={value} onChange={onChange} />}
    </View>
  );
}
