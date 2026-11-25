import { createContext, useContext, useEffect, useState } from "react";
import type { ScrollView } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, type AnimatedRef } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { TIMELINE_DEFAULT_SCALE, clampTimelineScale } from "@/utils/home/timeline";

// ================================
// Context
// ================================

/** 홈 타임라인 배율 (1분당 px). 시간 눈금·블록·현재 시각 선이 이 값으로 위치와 높이를 정함 */
export const TimelineScaleContext = createContext(TIMELINE_DEFAULT_SCALE);

/**
 * useTimelineScale — 지금 타임라인 배율 (1분당 px)
 * @returns 배율, TimelineScaleContext 밖에서는 기본 배율
 */
export function useTimelineScale() {
  return useContext(TimelineScaleContext);
}

// ================================
// Hooks
// ================================

/**
 * useTimelineZoom — 홈 타임라인을 두 손가락으로 벌리고 오므려 확대·축소
 * 손가락 사이 시각이 화면에서 제자리에 있도록 세로 스크롤 위치를 함께 옮김
 * 배율은 TIMELINE_SCALE_STEP 단위로 끊어 바뀔 때만 다시 그림
 * @param scrollRef 세로 타임라인 ScrollView 의 animated ref
 * @returns scale(지금 배율), pinchGesture(세로 ScrollView 제스처와 함께 인식시킬 핀치 제스처), handleScroll(세로 ScrollView onScroll 에서 호출)
 */
export function useTimelineZoom(scrollRef: AnimatedRef<ScrollView>) {
  const [scale, setScale] = useState(TIMELINE_DEFAULT_SCALE);
  // 배율을 바꾼 뒤 맞출 스크롤 위치, 다시 그린 다음 effect 에서 스크롤함
  const [zoomScrollY, setZoomScrollY] = useState<number | null>(null);
  const currentScale = useSharedValue(TIMELINE_DEFAULT_SCALE);
  const pinchStartScale = useSharedValue(TIMELINE_DEFAULT_SCALE);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (zoomScrollY === null) return;
    scrollRef.current?.scrollTo({ y: zoomScrollY, animated: false });
  }, [scrollRef, zoomScrollY]);

  const applyZoom = (next: number, nextScrollY: number) => {
    setScale(next);
    setZoomScrollY(nextScrollY);
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.set(currentScale.get());
    })
    .onUpdate((e) => {
      const prev = currentScale.get();
      const next = clampTimelineScale(pinchStartScale.get() * e.scale);
      if (next === prev) return;
      // 손가락 사이에 있던 시각(분)이 같은 화면 높이에 오도록 스크롤 위치를 다시 계산
      const focalMinute = (scrollY.get() + e.focalY) / prev;
      const nextScrollY = Math.max(0, focalMinute * next - e.focalY);
      currentScale.set(next);
      scrollY.set(nextScrollY);
      scheduleOnRN(applyZoom, next, nextScrollY);
    });

  const handleScroll = (y: number) => {
    scrollY.set(y);
  };

  return { scale, pinchGesture, handleScroll };
}
