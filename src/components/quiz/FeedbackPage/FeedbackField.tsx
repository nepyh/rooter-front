import type { ReactNode } from "react";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  label: string;
  showRequired: boolean;
  children: ReactNode;
}

/**
 * 피드백 질문 하나 (질문 이름 + 필수 안내 + 답 입력 영역)
 * @param label 질문 이름
 * @param showRequired 답하지 않았을 때 "필수 질문입니다" 안내를 띄울지
 * @param children 답 입력 영역
 */
export function FeedbackField({ label, showRequired, children }: Props) {
  return (
    <Stack gap="s" width="full">
      <Text variant="base-medium">{label}</Text>
      {showRequired && <Text variant="base-small" style={{ color: color.utility["error-primary"] }}>필수 질문입니다</Text>}
      {children}
    </Stack>
  );
}
