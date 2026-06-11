import { Text as RNText, TextProps } from "react-native";

// ================================
// Types
// ================================

type Variant =
  | "title-large"
  | "title-medium"
  | "title-small"
  | "header-large"
  | "header-medium"
  | "header-small"
  | "base-large"
  | "base-medium"
  | "base-small"
  | "base-caption";

type Weight = "regular" | "medium" | "semibold";
type Color = "primary" | "secondary" | "disabled";

// ================================
// Styles
// ================================

const variantStyles: Record<Variant, string> = {
  "title-large": "text-5xl font-semibold",
  "title-medium": "text-4xl font-semibold",
  "title-small": "text-3xl font-semibold",
  "header-large": "text-2xl font-semibold",
  "header-medium": "text-xl font-semibold",
  "header-small": "text-m font-semibold",
  "base-large": "text-lg font-regular",
  "base-medium": "text-base font-regular",
  "base-small": "text-sm font-regular",
  "base-caption": "text-xs font-regular",
};

const weightStyles: Record<Weight, string> = {
  "regular": "font-regular",
  "medium": "font-medium",
  "semibold": "font-semibold",
};

const colorStyles: Record<Color, string> = {
  "primary": "text-text-primary",
  "secondary": "text-text-secondary",
  "disabled": "text-text-disabled",
};

// ================================
// Components
// ================================

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: Color;
  className?: string;
}

/**
 * Text 컴포넌트
 * @param variant 폰트 타입을 설정합니다.
 * @param weight 폰트 굵기를 설정합니다.
 */
export function Text({ variant = "base-medium", weight, color = "primary", className = "", ...props }: Props) {
  return (
    <RNText
      className={`
        ${variantStyles[variant]}
        ${weight ? weightStyles[weight] : ""}
        ${colorStyles[color]}
        ${className}
      `}
      {...props}
    />
  );
}
