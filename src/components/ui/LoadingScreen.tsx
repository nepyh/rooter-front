import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
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
  text: string;
  onBack: () => void;
}

/**
 * 도는 로딩 아이콘과 문구를 화면 가운데에 보여주는 전체 화면 로딩
 * @param text 아이콘 아래에 보여줄 문구를 입력합니다.
 * @param onBack 왼쪽 위 뒤로가기 버튼을 눌렀을 때 실행할 행동을 입력합니다.
 */
export function LoadingScreen({ text, onBack }: Props) {
  const rotation = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1);
  }, [rotation]);

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <View className="flex-row items-center pb-spacing-5">
        <Pressable onPress={onBack}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center">
        <View style={{ alignItems: "center", gap: getSpacing("spacing-8") }}>
          <Animated.View style={spinnerStyle}>
            <Icon name="loading" size={60} color={color.primary["500"]} />
          </Animated.View>
          <Text variant="title-small">{text}</Text>
        </View>
      </View>
    </View>
  );
}
