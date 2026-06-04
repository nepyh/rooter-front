import { Text as RNText, TextProps } from "react-native";

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

type Weight = "regular" | "medium" | "semibold";

const weightStyles: Record<Weight, string> = {
  "regular": "font-regular",
  "medium": "font-medium",
  "semibold": "font-semibold",
};

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  className?: string;
}

export function Text({ variant = "base-medium", weight, className = "", ...props }: Props) {
  return (
    <RNText
      className={`
        ${variantStyles[variant]}
        ${weight ? weightStyles[weight] : ""}
        ${className}
      `}
      {...props}
    />
  );
}