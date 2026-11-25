import { useLayoutEffect } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { SWIPE_ACTIVE_X, SWIPE_FAIL_Y, SWIPE_FLING_VELOCITY, SWIPE_PAGE_RATIO } from "@/constants/swipe";

// ================================
// Constants
// ================================

/** 넘길 때 지금 달이 옆으로 빠지는 시간, 기준에 못 미쳐 제자리로 돌아오는 시간 */
const SLIDE_OUT_MS = 160;
const SNAP_BACK_MS = 200;

// ================================
// Hooks
// ================================

/**
 * useMonthSwipe — 달력을 좌우로 끌어 이전·다음 달로 넘기는 제스처
 * 끄는 동안 달력이 손가락을 따라오고, 놓았을 때 홈 날짜 넘기기와 같은 기준(constants/swipe)을 넘으면
 * 지금 달을 옆으로 밀어낸 뒤 달을 바꾸고, 못 넘으면 제자리로 돌아옴
 * 탭은 가로로 SWIPE_ACTIVE_X 이상 움직이기 전까지 그대로 날짜 칸에 전달됨
 * @param pageKey 보고 있는 달을 구분하는 값. 바뀌면(새 달이 그려지면) 밀어둔 위치를 되돌림
 * @param onPrev 오른쪽으로 넘겼을 때 호출 (이전 달)
 * @param onNext 왼쪽으로 넘겼을 때 호출 (다음 달)
 * @param canGoPrev 이전 달로 넘길 수 있는지. false 면 오른쪽으로 끌어도 제자리로 돌아옴 (고를 수 있는 가장 이른 달)
 * @param canGoNext 다음 달로 넘길 수 있는지. false 면 왼쪽으로 끌어도 제자리로 돌아옴 (고를 수 있는 가장 늦은 달)
 * @returns gesture(GestureDetector 에 넘김), animatedStyle(움직일 Animated.View 에 넘김), onLayout(달력 너비 측정)
 */
export function useMonthSwipe(pageKey: string, onPrev: () => void, onNext: () => void, canGoPrev = true, canGoNext = true) {
  const width = useSharedValue(0);
  const translateX = useSharedValue(0);

  // 새 달이 화면에 붙기 전에 위치를 되돌려, 밀려난 옛 달이 가운데에 잠깐 다시 보이지 않게 함
  useLayoutEffect(() => {
    translateX.set(0);
  }, [pageKey, translateX]);

  const move = (delta: number) => (delta > 0 ? onNext() : onPrev());

  const gesture = Gesture.Pan()
    .activeOffsetX([-SWIPE_ACTIVE_X, SWIPE_ACTIVE_X])
    .failOffsetY([-SWIPE_FAIL_Y, SWIPE_FAIL_Y])
    .onUpdate((e) => {
      translateX.set(e.translationX);
    })
    .onEnd((e) => {
      let delta = 0;
      if (Math.abs(e.velocityX) > SWIPE_FLING_VELOCITY) delta = e.velocityX < 0 ? 1 : -1;
      else if (Math.abs(e.translationX) > width.get() * SWIPE_PAGE_RATIO) delta = e.translationX < 0 ? 1 : -1;
      if (delta < 0 && !canGoPrev) delta = 0;
      if (delta > 0 && !canGoNext) delta = 0;

      if (delta === 0) {
        translateX.set(withTiming(0, { duration: SNAP_BACK_MS }));
        return;
      }
      translateX.set(withTiming(-delta * width.get(), { duration: SLIDE_OUT_MS }, (finished) => {
        if (finished) scheduleOnRN(move, delta);
      }));
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.get() }] }));

  const onLayout = (e: LayoutChangeEvent) => {
    width.set(e.nativeEvent.layout.width);
  };

  return { gesture, animatedStyle, onLayout };
}
