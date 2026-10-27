import type { ReactNode } from "react";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Types
// ================================

type Spacing = "top" | "none";

// ================================
// Styles
// ================================

const spacingStyles: Record<Spacing, string> = {
  "top": "pt-spacing-9",
  "none": "",
};

// ================================
// Components
// ================================

interface Props {
  title: string;
  spacing?: Spacing;
  children: ReactNode;
}

/**
 * 더보기 화면들의 구역 (작은 회색 제목 + 내용)
 * @param title 구역 제목 (예: 일반, 데일리)
 * @param spacing 위쪽 여백 (top: 앞 구역과 띄움, none: 여백 없음)
 * @param children 구역 내용
 */
export function MoreSection({ title, spacing = "top", children }: Props) {
  return (
    <Stack gap="l" width="full" className={spacingStyles[spacing]}>
      <Text variant="base-medium" weight="medium" color="secondary">{title}</Text>
      {children}
    </Stack>
  );
}
