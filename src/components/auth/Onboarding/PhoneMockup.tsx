import { useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

// ================================
// Constants
// ================================

// 피그마 기준 이미지 높이, 화면이 작으면 이보다 줄어듦
const MAX_HEIGHT = 460;
// 원본 이미지 비율 4:3
const ASPECT_RATIO = 4 / 3;
// 위로 떠오르는 거리
const FLOAT_DISTANCE = 13;
// 한 번 오르내리는 데 걸리는 시간의 절반
const HALF_CYCLE_MS = 897;

// ================================
// Components
// ================================

interface Props {
  className?: string;
}

/**
 * 온보딩 화면의 휴대폰 목업 이미지, 위아래로 천천히 떠다님
 * @param className 바깥 영역 스타일을 덮어씁니다.
 */
export function PhoneMockup({ className = "" }: Props) {
  const translateY = useSharedValue(0);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  useEffect(() => {
    translateY.set(withRepeat(
      withSequence(
        withTiming(-FLOAT_DISTANCE, { duration: HALF_CYCLE_MS, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: HALF_CYCLE_MS, easing: Easing.in(Easing.ease) }),
      ),
      -1,
    ));
  }, [translateY]);

  return (
    <View className={`items-center justify-end ${className}`}>
      <Animated.View style={[{ height: "100%", maxHeight: MAX_HEIGHT, aspectRatio: ASPECT_RATIO }, floatStyle]}>
        <Image source={require("@/assets/images/rooter_phone.png")} style={{ width: "100%", height: "100%" }} contentFit="contain" />
      </Animated.View>
    </View>
  );
}
