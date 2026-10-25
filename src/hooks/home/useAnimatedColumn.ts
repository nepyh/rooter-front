import { useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

// ================================
// Constants
// ================================

const COLUMN_TIMING = { duration: 160 };

// ================================
// Hooks
// ================================

/**
 * useAnimatedColumn — 타임라인 블록의 가로 위치·너비를 칸 배치가 바뀔 때 부드럽게 옮김
 * 일정을 끄는 동안 주변 블록이 자리를 비켜 주거나 넓어질 때 씀
 * @param left 칸 배치로 계산한 왼쪽 위치(px)
 * @param width 칸 배치로 계산한 너비(px)
 * @param frozen true 면 값이 바뀌어도 따라가지 않음 (끌고 있는 블록은 손가락 아래에서 크기를 유지)
 * @returns x(왼쪽 위치), width(너비) 공유값
 */
export function useAnimatedColumn(left: number, width: number, frozen = false) {
  const x = useSharedValue(left);
  const animatedWidth = useSharedValue(width);

  useEffect(() => {
    if (frozen) return;
    x.set(withTiming(left, COLUMN_TIMING));
    animatedWidth.set(withTiming(width, COLUMN_TIMING));
  }, [left, width, frozen, x, animatedWidth]);

  return { x, width: animatedWidth };
}
