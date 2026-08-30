import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// ================================
// Constants
// ================================

const SWITCH_WIDTH = 48;
const SWITCH_HEIGHT = 28;
const SWITCH_PADDING = 2;
const THUMB_SIZE = 24;
const THUMB_TRAVEL = SWITCH_WIDTH - THUMB_SIZE - SWITCH_PADDING * 2;

// ================================
// Components
// ================================

interface Props {
  value: boolean;
  onToggle: () => void;
}

/**
 * Switch 컴포넌트
 * @param value 켜짐/꺼짐 상태를 설정합니다.
 * @param onToggle 눌렀을 때 실행할 동작을 입력합니다.
 */
export function Switch({ value, onToggle }: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["#6B7280", "#F6482D"]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * THUMB_TRAVEL }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View
        style={[
          { width: SWITCH_WIDTH, height: SWITCH_HEIGHT, borderRadius: SWITCH_HEIGHT / 2, padding: SWITCH_PADDING },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, backgroundColor: "#FFFFFF" }, thumbStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}
