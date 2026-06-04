import { useState } from "react";
import { Pressable, PressableProps } from "react-native";
import { Text } from "./Text";

// ================================
// Types
// ================================

type Variant = "primary" | "white" | "black" | "disabled";
type Width = "full" | "auto";

// ================================
// Styles
// ================================

const variantStyles: Record<Variant, { default: string; pressed: string; }> = {
  "primary": {
    default: "bg-primary-500",
    pressed: "bg-primary-700",
  },
  "white": {
    default: "bg-neutral-0",
    pressed: "bg-neutral-200",
  },
  "black": {
    default: "bg-neutral-1000",
    pressed: "bg-neutral-1000",
  },
  "disabled": {
    default: "bg-neutral-700",
    pressed: "bg-neutral-900",
  },
};

const widthStyles: Record<Width, string> = {
  "full": "w-full",
  "auto": "w-auto",
};

// ================================
// Components
// ================================

interface Props extends PressableProps {
  variant?: Variant;
  width?: Width;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Button 컴포넌트
 * @param variant 버튼 타입을 설정합니다.
 * @param width 버튼 width를 설정합니다.
 */
export function Button({ variant = "primary", width = "full", children, className = "", ...props }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      disabled={variant === "disabled"}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`
        ${widthStyles[width]}
        items-center justify-center
        py-m rounded-md
        ${pressed ? variantStyles[variant].pressed : variantStyles[variant].default}
        ${className}
      `}
      {...props}
    >
      <Text variant="base-medium">
        {children}
      </Text>
    </Pressable>
  );
}