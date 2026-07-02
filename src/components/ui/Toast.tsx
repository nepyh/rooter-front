import { useEffect } from 'react';
import { View } from "react-native";
import { Text } from "./Text";
import Animated, { FadeOut } from "react-native-reanimated";

// ================================
// Components
// ================================

interface Props {
  text: string;
  onClose: () => void;
  className?: string;
}

/**
 * Toast 컴포넌트
 * @param text Toast 컴포넌트에 들어갈 Text를 입력합니다.
 * @param onClose Toast의 Timeout이 종료될 때 실행할 행동을 입력합니다.
 */
export function Toast({ text, onClose, className = "" }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      className="absolute bottom-[80px] w-full items-center z-10"
    >
      <Animated.View
        className={`
          py-m px-l
          rounded-xs
          bg-neutral-1000
          ${className}
        `}
      >
        <Text variant="base-medium">{text}</Text>
      </Animated.View>
    </Animated.View>
  );
}