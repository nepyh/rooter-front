import { View } from "react-native";
import { Text } from "./Text";

// ================================
// Components
// ================================

interface Props {
  text: string;
  className?: string;
}

/**
 * Toast 컴포넌트
 * @param text Toast 컴포넌트에 들어갈 Text를 입력합니다.
 */
export function Toast({ text, className = "" }: Props) {
  return (
    <View className="absolute bottom-[68px] w-full items-center z-10">
      <View
        className={`
          py-m px-l
          rounded-xs
          bg-neutral-1000
          ${className}
        `}
      >
        <Text variant="base-medium"> {text} </Text>
      </View>
    </View>
  );
}