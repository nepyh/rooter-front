import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Text } from "./Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/token";

// ================================
// Constants
// ================================

// 한 바퀴 도는 시간
const SPIN_MS = 900;

// ================================
// Components
// ================================

interface Props {
  text?: string;
  className?: string;
}

/**
 * 목록 자리에 들어가는 불러오는 중 표시, 감싼 영역 가운데에 도는 아이콘과 문구
 * @param text 아이콘 아래 문구를 입력합니다.
 * @param className 바깥 영역 스타일을 덮어씁니다.
 */
export function LoadingView({ text = "불러오는 중...", className = "" }: Props) {
  const rotation = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1);
  }, [rotation]);

  return (
    <View className={`flex-1 items-center justify-center py-spacing-9 ${className}`} style={{ gap: getSpacing("spacing-5") }}>
      <Animated.View style={spinnerStyle}>
        <Icon name="loading" size={36} color={color.primary["500"]} />
      </Animated.View>
      <Text variant="base-medium" color="secondary">{text}</Text>
    </View>
  );
}
