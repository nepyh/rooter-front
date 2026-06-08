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

interface VariantProps {
  default: string;
  pressed: string;
  textColor: string;
}

const variantStyles: Record<Variant, VariantProps> = {
  "primary": {
    default: "bg-primary-500",
    pressed: "bg-primary-600",
    textColor: "text-text-primary",
  },
  "white": {
    default: "bg-neutral-0",
    pressed: "bg-neutral-100",
    textColor: "text-neutral-1000",
  },
  "black": {
    default: "bg-neutral-1000",
    pressed: "bg-neutral-1000",
    textColor: "text-text-primary",
  },
  "disabled": {
    default: "bg-neutral-700",
    pressed: "bg-neutral-900",
    textColor: "text-text-primary",
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
        py-xl items-center justify-center rounded-xl
        ${widthStyles[width]}
        ${pressed ? variantStyles[variant].pressed : variantStyles[variant].default}
        ${className}
      `}
      {...props}
    >
      <Text variant="base-medium" weight="medium" className={variantStyles[variant].textColor}>
        {children}
      </Text>
    </Pressable>
  );
}
