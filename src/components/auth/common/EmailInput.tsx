import type { ComponentProps } from "react";
import { Input } from "../../ui/Input";

// ================================
// Components
// ================================

type Props = ComponentProps<typeof Input>;

/**
 * 이메일 입력칸. 라벨·placeholder·자동 대문자/자동 수정 끄기·이메일 키보드(@, . 버튼)가 미리 설정되어 있음
 * @param props Input 의 props 를 그대로 받고, 넘긴 값이 기본값을 덮어씀
 */
export function EmailInput(props: Props) {
  return (
    <Input
      label="이메일"
      placeholder="이메일을 입력해주세요"
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="email-address"
      {...props}
    />
  );
}
