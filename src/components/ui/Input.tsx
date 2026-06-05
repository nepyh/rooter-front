import { useState } from "react";
import { View, TextInput, TextInputProps } from "react-native";
import { Text } from "./Text";

// ================================
// Types
// ================================

type State = "default" | "focused";

// ================================
// Styles
// ================================

const stateStyles: Record<State, string> = {
  "default": "bg-neutral-700",
  "focused": "border-2 border-primary-500 bg-neutral-700",
};

// ================================
// Components
// ================================

interface Props extends TextInputProps{
  state?: State;
  label?: string;
  className?: string;
}

/**
 * Input 컴포넌트
 * @param state Input 상태를 설정합니다.
 * @param label Input label을 추가합니다.
 */
export function Input({ state = "default", label, className = "", ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="p-xl w-full gap-xxs rounded-md bg-neutral-700">
      {label &&
        <Text variant="base-caption" weight="medium" className="text-secondary">
          {label}
        </Text>
      }
      <TextInput
        className={`
          text-lg
          text-white
          ${className}
        `}
        placeholderTextColor="#C9CDD6"
        {...props}
      />
    </View>
  );
}