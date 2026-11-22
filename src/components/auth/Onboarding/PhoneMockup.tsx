import { useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

// ================================
// Constants
// ================================

// 피그마 기준 이미지 높이, 화면이 작으면 이보다 줄어듦
const MAX_HEIGHT = 460;
// 원본 이미지 비율 4:3
const ASPECT_RATIO = 4 / 3;
// 떠오를 때 위로 움직이는 거리
const FLOAT_Y = -13;
// 떠오를 때 왼쪽으로 움직이는 거리
const FLOAT_X = -1;
// 한 번 오르내리는 데 걸리는 시간의 절반
const HALF_CYCLE_MS = 897;
// 피그마 ease-out, ease-in 곡선
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);
const EASE_IN = Easing.bezier(0.42, 0, 1, 1);

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
  const progress = useSharedValue(0);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: FLOAT_X * progress.get() },
      { translateY: FLOAT_Y * progress.get() },
    ],
  }));

  useEffect(() => {
    progress.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: HALF_CYCLE_MS, easing: EASE_OUT }),
          withTiming(0, { duration: HALF_CYCLE_MS, easing: EASE_IN }),
        ),
        -1,
      ),
    );
  }, [progress]);

  return (
    <View className={`items-center justify-end ${className}`}>
      <Animated.View
        style={[
          { height: "100%", maxHeight: MAX_HEIGHT, aspectRatio: ASPECT_RATIO },
          floatStyle,
        ]}
      >
        <Image
          source={require("@/assets/images/rooter_phone.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}
