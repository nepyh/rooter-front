import { useRef, useState, type RefObject } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";

// ================================
// Constants
// ================================

const JUMP_FALLBACK_MS = 400;

// ================================
// Hooks
// ================================

/**
 * useDayPager — 홈 타임라인을 좌우로 넘겨 날짜를 바꾸는 가로 페이지(어제 | 오늘 | 내일) 관리
 * iOS 는 세로 ScrollView 가 터치를 먼저 가져가 JS 제스처가 끊겨서, 네이티브 페이지 스크롤로 처리합니다.
 * @param dayOffset 오늘 기준 며칠 떨어진 날을 보고 있는지 (0 이 오늘)
 * @param onMoveDay 날짜를 delta 만큼 옮길 때 호출
 * @param scrollYRef 세로 타임라인의 현재 스크롤 위치, 옆 페이지 눈금을 같은 높이로 맞출 때 씀
 * @returns pagerRef, pageWidth, setPageWidth, neighborOffset, neighborDeltas(옆 페이지가 지금 날짜에서 며칠 떨어졌는지, [오늘로] 이동 중에는 오늘), syncNeighborOffset, goToday, handlePagerEnd
 */
export function useDayPager(dayOffset: number, onMoveDay: (delta: number) => void, scrollYRef: RefObject<number>) {
  const pagerRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [neighborOffset, setNeighborOffset] = useState(0);
  const pendingJumpRef = useRef<number | null>(null);
  const [pendingJump, setPendingJump] = useState<number | null>(null);
  const neighborDeltas = {
    prev: pendingJump !== null && pendingJump < 0 ? pendingJump : -1,
    next: pendingJump !== null && pendingJump > 0 ? pendingJump : 1,
  };

  const syncNeighborOffset = () => setNeighborOffset(scrollYRef.current);

  const finishJump = () => {
    const delta = pendingJumpRef.current;
    if (delta === null) return;
    pendingJumpRef.current = null;
    setPendingJump(null);
    onMoveDay(delta);
    pagerRef.current?.scrollTo({ x: pageWidth, animated: false });
  };

  const goToday = () => {
    if (!pageWidth) {
      onMoveDay(-dayOffset);
      return;
    }
    pendingJumpRef.current = -dayOffset;
    setPendingJump(-dayOffset);
    syncNeighborOffset();
    pagerRef.current?.scrollTo({ x: dayOffset > 0 ? 0 : pageWidth * 2, animated: true });
    setTimeout(finishJump, JUMP_FALLBACK_MS);
  };

  const handlePagerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    if (pendingJumpRef.current !== null) {
      finishJump();
      return;
    }
    const page = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (page !== 1) onMoveDay(page - 1);
    pagerRef.current?.scrollTo({ x: pageWidth, animated: false });
  };

  return { pagerRef, pageWidth, setPageWidth, neighborOffset, neighborDeltas, syncNeighborOffset, goToday, handlePagerEnd };
}
