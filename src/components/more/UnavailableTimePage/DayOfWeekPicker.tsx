import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { DAY_OF_WEEK_LABELS } from "@/api/user";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type State = "selected" | "unselected";

// ================================
// Styles
// ================================

const pillStyles: Record<State, string> = {
  "selected": "border-primary-500 bg-primary-500/15",
  "unselected": "border-neutral-600 bg-transparent",
};

const textColors: Record<State, string> = {
  "selected": color.primary["500"],
  "unselected": color.neutral["400"],
};

// ================================
// Components
// ================================

interface Props {
  value: number;
  onChange: (dayOfWeek: number) => void;
}

/**
 * 월~일 요일 하나를 고르는 버튼 줄
 * @param value 고른 요일 (1=월 ~ 7=일)
 * @param onChange 요일을 눌렀을 때 호출
 */
export function DayOfWeekPicker({ value, onChange }: Props) {
  return (
    <Row gap="s" className="flex-wrap">
      {DAY_OF_WEEK_LABELS.map((label, i) => {
        const dayOfWeek = i + 1;
        const state: State = value === dayOfWeek ? "selected" : "unselected";
        return (
          <Pressable key={label} onPress={() => onChange(dayOfWeek)} className={`px-spacing-5 py-spacing-3 rounded-radius-full border-2 ${pillStyles[state]}`}>
            <Text weight="medium" style={{ color: textColors[state] }}>{label}</Text>
          </Pressable>
        );
      })}
    </Row>
  );
}
