import type { ComponentProps } from "react";
import { Input } from "../../ui/Input";

// ================================
// Components
// ================================

type Props = ComponentProps<typeof Input>;

/**
 * 비밀번호 입력칸. 가려진 입력과 기본 라벨·placeholder 가 미리 설정되어 있음
 * @param props Input 의 props 를 그대로 받고, 넘긴 값이 기본값을 덮어씀 (비밀번호 확인 칸은 label, placeholder 를 넘김)
 */
export function PasswordInput(props: Props) {
  return (
    <Input
      label="비밀번호"
      placeholder="비밀번호를 입력해주세요"
      secureTextEntry
      {...props}
    />
  );
}
