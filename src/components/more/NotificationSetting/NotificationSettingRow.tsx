import type { ReactNode } from "react";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * 알림 설정 한 줄 (제목·설명 + 오른쪽 조작 요소)
 * @param title 설정 이름
 * @param description 설정 설명
 * @param children 오른쪽에 둘 스위치나 값 칩
 */
export function NotificationSettingRow({ title, description, children }: Props) {
  return (
    <Row gap="l" width="full" className="items-center">
      <Stack gap="s" className="flex-1">
        <Text variant="header-medium">{title}</Text>
        <Text variant="base-medium" color="secondary">{description}</Text>
      </Stack>
      {children}
    </Row>
  );
}
