import { Pressable } from "react-native";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { color } from "@/constants/token/color";
import type { OptionState } from "@/utils/quiz/quiz";

// ================================
// Styles
// ================================

const optionStyles: Record<OptionState, string> = {
  "default": "border-neutral-600",
  "selected": "border-primary-500 bg-primary-500/30",
  "correct": "border-utility-success-primary bg-utility-success-primary/30",
  "wrong": "border-utility-error-primary bg-utility-error-primary/30",
};

const optionIcons: Partial<Record<OptionState, { name: IconName; color: string }>> = {
  "correct": { name: "check", color: color.utility["success-primary"] },
  "wrong": { name: "close", color: color.utility["error-primary"] },
};

// ================================
// Components
// ================================

interface Props {
  label: string;
  state: OptionState;
  onPress?: () => void;
}

/**
 * 퀴즈 보기 하나. 고름·정답·오답 상태에 따라 테두리 색과 아이콘이 바뀜
 * @param label 보기 글
 * @param state 표시 상태
 * @param onPress 눌렀을 때 호출, 없으면 누를 수 없음
 */
export function QuizOptionRow({ label, state, onPress }: Props) {
  const icon = optionIcons[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row gap-spacing-3 items-center justify-center p-spacing-6 rounded-radius-4 border-2 w-full ${optionStyles[state]}`}
    >
      {icon && <Icon name={icon.name} size={20} color={icon.color} />}
      <Text variant="base-large" className="text-center">{label}</Text>
    </Pressable>
  );
}
