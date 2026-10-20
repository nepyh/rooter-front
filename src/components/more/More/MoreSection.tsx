import type { ReactNode } from "react";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  title: string;
  children: ReactNode;
}

/**
 * 마이페이지의 구역 (작은 회색 제목 + 내용)
 * @param title 구역 제목 (예: 일반, 데일리)
 * @param children 구역 내용
 */
export function MoreSection({ title, children }: Props) {
  return (
    <Stack gap="l" width="full" className="pt-spacing-9">
      <Text variant="base-medium" weight="medium" color="secondary">{title}</Text>
      {children}
    </Stack>
  );
}
