import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../../ui/Text";
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
  value: string;
  active: boolean;
  onPress: () => void;
  children: ReactNode;
}

/**
 * 시간 항목 한 줄. 누르면 아래에 휠이 펼쳐짐
 * @param label 항목 이름
 * @param value 지금 고른 값
 * @param active 휠을 펼친 상태인지
 * @param onPress 줄을 눌렀을 때 호출
 * @param children 펼쳤을 때 보여줄 휠
 */
export function TimeRow({ label, value, active, onPress, children }: Props) {
  return (
    <View className="w-full bg-neutral-700 rounded-radius-4 px-spacing-6 py-spacing-5" style={{ gap: getSpacing("spacing-5") }}>
      <Pressable onPress={onPress} className="flex-row items-center justify-between w-full" style={{ minHeight: 34 }}>
        <Text variant="base-large" weight="medium">{label}</Text>
        <View className={`px-spacing-4 py-spacing-3 rounded-radius-full ${valueStyles[active ? "active" : "inactive"]}`}>
          <Text variant="base-small">{value}</Text>
        </View>
      </Pressable>
      {active && children}
    </View>
  );
}
