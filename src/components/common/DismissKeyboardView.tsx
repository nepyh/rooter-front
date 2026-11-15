import { Keyboard, Pressable, PressableProps } from "react-native";

// ================================
// Components
// ================================

interface Props extends PressableProps {
  className?: string;
}

/**
 * 감싼 영역의 빈 곳을 누르면 키보드를 내림.
 * 안쪽 버튼·입력칸·스크롤은 그대로 동작하고, 아무도 받지 않은 터치만 여기로 와서 키보드를 내림.
 * RN Modal 은 앱과 다른 창에 그려져 _layout 의 처리가 닿지 않으므로, 입력칸이 있는 모달은 안쪽을 따로 감싸야 함
 * @param className 덧붙일 스타일
 */
export function DismissKeyboardView({ className = "", ...props }: Props) {
  return (
    <Pressable
      accessible={false}
      onPress={Keyboard.dismiss}
      className={className}
      {...props}
    />
  );
}
