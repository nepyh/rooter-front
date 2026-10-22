import { ScrollViewProps, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { VerticalGradient } from "./VerticalGradient";
import { color } from "@/constants/token/color";

// ================================
// Constants
// ================================

const BOTTOM_FADE_THRESHOLD = 24;

// ================================
// Components
// ================================

interface Props extends Omit<ScrollViewProps, "onScroll"> {
  fadeHeight: number;
  className?: string;
}

/**
 * 아래로 더 스크롤할 수 있을 때만 하단을 배경색으로 흐리게 덮는 세로 스크롤 목록. 끝까지 내리면 흐림이 사라짐
 * @param fadeHeight 하단 흐림 높이
 * @param className 바깥 영역 스타일
 */
export function FadeScrollView({ fadeHeight, className = "", onLayout, onContentSizeChange, children, ...props }: Props) {
  const offsetY = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  const canScrollMore = useDerivedValue(() => contentHeight.get() - layoutHeight.get() - offsetY.get() > BOTTOM_FADE_THRESHOLD);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: withTiming(canScrollMore.get() ? 1 : 0, { duration: 200 }) }));

  const handleScroll = useAnimatedScrollHandler((e) => {
    offsetY.set(e.contentOffset.y);
  });

  return (
    <View className={`flex-1 ${className}`}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => {
          layoutHeight.set(e.nativeEvent.layout.height);
          onLayout?.(e);
        }}
        onContentSizeChange={(width, height) => {
          contentHeight.set(height);
          onContentSizeChange?.(width, height);
        }}
        {...props}
      >
        {children}
      </Animated.ScrollView>
      <Animated.View style={[{ position: "absolute", left: 0, right: 0, bottom: 0, height: fadeHeight, pointerEvents: "none" }, fadeStyle]}>
        <VerticalGradient
          stops={[
            { offset: 0, color: color.background.primary, opacity: 0 },
            { offset: 1, color: color.background.primary },
          ]}
          className="flex-1"
        />
      </Animated.View>
    </View>
  );
}
