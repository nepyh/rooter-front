import { View, ViewProps } from "react-native";

// ================================
// Types
// ================================

const Gap = {
  none: 0,
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 32,
} as const;

type Width = "full" | "auto";
type Gap = keyof typeof Gap;

// ================================
// Styles
// ================================

const widthStyles: Record<Width, string> = {
  "full": "w-full",
  "auto": "w-auto",
};

// ================================
// Components
// ================================

interface Props extends ViewProps {
  width?: Width;
  gap?: Gap;
  className?: string;
}

/**
 * Row 컴포넌트
 * @param gap Row 간격을 설정합니다.
 * @param width Row width를 설정합니다.
 */
export function Row({ gap = "none", width = "auto", className = "", children, ...props }: Props) {
  return (
    <View
      className={`
        flex-row items-center
        ${widthStyles[width]}
        ${className}
      `}
      style={{ gap: Gap[gap] }}
      {...props}
    >
      {children}
    </View>
  );
}