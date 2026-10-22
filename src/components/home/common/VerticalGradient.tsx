import { useId } from "react";
import { View, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// ================================
// Types
// ================================

interface GradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

// ================================
// Components
// ================================

interface Props extends ViewProps {
  stops: GradientStop[];
  className?: string;
}

/**
 * 위에서 아래로 색이 바뀌는 그라데이션 배경. 터치는 아래로 그대로 통과함
 * @param stops 색이 바뀌는 지점 목록 (offset 0 = 맨 위, 1 = 맨 아래, opacity 기본값 1)
 */
export function VerticalGradient({ stops, className = "", style, ...props }: Props) {
  const id = `gradient-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View className={className} style={[{ pointerEvents: "none" }, style]} {...props}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            {stops.map((stop) => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
