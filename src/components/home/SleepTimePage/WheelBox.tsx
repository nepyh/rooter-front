import type { ReactNode } from "react";
import { View } from "react-native";
import { WHEEL_HEIGHT, WHEEL_ITEM_HEIGHT, WHEEL_PADDING_ROWS } from "./wheel";

// ================================
// Components
// ================================

interface Props {
  children: ReactNode;
}

/**
 * 휠들을 감싸는 상자. 가운데 줄에 선택 표시를 깔아 줌
 * @param children 나란히 놓을 WheelColumn 들
 */
export function WheelBox({ children }: Props) {
  return (
    <View className="bg-neutral-800 rounded-radius-4 flex-row justify-center" style={{ height: WHEEL_HEIGHT }}>
      <View
        pointerEvents="none"
        className="absolute left-spacing-0 right-spacing-0 rounded-radius-3 bg-neutral-500/30"
        style={{ top: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS, height: WHEEL_ITEM_HEIGHT }}
      />
      {children}
    </View>
  );
}
