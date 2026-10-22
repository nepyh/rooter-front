import type { ScrollView } from "react-native";
import { measure, scrollTo, useFrameCallback, useSharedValue, type AnimatedRef } from "react-native-reanimated";

// ================================
// Types
// ================================

export type AutoScroll = ReturnType<typeof useAutoScroll>;

// ================================
// Constants
// ================================

const EDGE_SIZE = 64;
const MAX_SPEED = 12;

// ================================
// Hooks
// ================================

/**
 * useAutoScroll — 계획 블록을 끌다가 손가락이 타임라인 위·아래 끝에 가까워지면 세로 타임라인을 저절로 스크롤
 * 끝에 가까울수록 빠르게 스크롤하고, 스크롤한 거리를 scrollDelta 에 쌓아 끄는 블록이 손가락 아래에 그대로 있게 보정할 때 씀
 * begin·update·end 는 제스처 콜백(UI 스레드)에서 부르는 worklet
 * @param scrollRef 세로 타임라인 ScrollView 의 animated ref
 * @param contentHeight 스크롤 내용 전체 높이(px)
 * @returns scrollDelta(이번 끌기 동안 저절로 스크롤한 거리), handleScroll(ScrollView onScroll 에서 호출), begin(끌기 시작), update(손가락 위치 갱신), end(끌기 끝)
 */
export function useAutoScroll(scrollRef: AnimatedRef<ScrollView>, contentHeight: number) {
  const scrollY = useSharedValue(0);
  const scrollDelta = useSharedValue(0);
  const speed = useSharedValue(0);
  const active = useSharedValue(false);
  const viewportTop = useSharedValue(0);
  const viewportHeight = useSharedValue(0);

  useFrameCallback(() => {
    const step = speed.get();
    if (!active.get() || step === 0) return;
    const current = scrollY.get();
    const maxY = Math.max(contentHeight - viewportHeight.get(), 0);
    const next = Math.min(Math.max(current + step, 0), maxY);
    if (next === current) return;
    scrollTo(scrollRef, 0, next, false);
    scrollY.set(next);
    scrollDelta.set(scrollDelta.get() + next - current);
  });

  const handleScroll = (y: number) => {
    if (!active.get()) scrollY.set(y);
  };

  const begin = () => {
    "worklet";
    const frame = measure(scrollRef);
    if (frame) {
      viewportTop.set(frame.pageY);
      viewportHeight.set(frame.height);
    }
    scrollDelta.set(0);
    speed.set(0);
    active.set(true);
  };

  const update = (absoluteY: number) => {
    "worklet";
    if (!active.get()) return;
    const y = absoluteY - viewportTop.get();
    const bottomEdge = viewportHeight.get() - EDGE_SIZE;
    if (y < EDGE_SIZE) speed.set(-MAX_SPEED * Math.min((EDGE_SIZE - y) / EDGE_SIZE, 1));
    else if (y > bottomEdge) speed.set(MAX_SPEED * Math.min((y - bottomEdge) / EDGE_SIZE, 1));
    else speed.set(0);
  };

  const end = () => {
    "worklet";
    speed.set(0);
    active.set(false);
  };

  return { scrollDelta, handleScroll, begin, update, end };
}
