import type { ReactNode } from "react";
import { Stack } from "../../layout";

// ================================
// Components
// ================================

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * MenuRow 들을 감싸는 둥근 회색 상자
 * @param children 넣을 MenuRow 들
 * @param className 바깥 여백 등을 덧붙일 클래스
 */
export function MenuGroup({ children, className = "" }: Props) {
  return (
    <Stack gap="xs" width="full" className={`bg-neutral-700 p-spacing-2 rounded-radius-4 ${className}`}>
      {children}
    </Stack>
  );
}
