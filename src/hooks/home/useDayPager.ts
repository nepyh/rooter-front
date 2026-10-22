import { useRef, useState, type RefObject } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";

// ================================
// Constants
// ================================

const JUMP_FALLBACK_MS = 1000;
const ARRIVE_TOLERANCE_PX = 1;

// ================================
// Hooks
// ================================

/**
 * useDayPager — 홈 타임라인을 좌우로 넘겨 날짜를 바꾸는 가로 페이지(어제 | 오늘 | 내일) 관리
 * iOS 는 세로 ScrollView 가 터치를 먼저 가져가 JS 제스처가 끊겨서, 네이티브 페이지 스크롤로 처리합니다.
 * [오늘로] 이동은 스크롤 위치가 목표 페이지에 닿았을 때 마무리하고, 스크롤이 끝난 이벤트로는 손으로 넘겼을 때만 날짜를 바꿉니다.
 * 코드로 굴린 스크롤의 끝 이벤트는 플랫폼마다 늦게 오거나 안 와서, 그걸로 페이지를 세면 날짜가 한 번 더 바뀌기 때문입니다.
 * @param dayOffset 오늘 기준 며칠 떨어진 날을 보고 있는지 (0 이 오늘)
 * @param onMoveDay 날짜를 delta 만큼 옮길 때 호출
 * @param scrollYRef 세로 타임라인의 현재 스크롤 위치, 옆 페이지 눈금을 같은 높이로 맞출 때 씀
 * @returns pagerRef, pageWidth, setPageWidth, neighborOffset, neighborDeltas(옆 페이지가 지금 날짜에서 며칠 떨어졌는지, [오늘로] 이동 중에는 오늘), goToday, handlePagerBeginDrag, handlePagerScroll, handlePagerEnd
 */
export function useDayPager(dayOffset: number, onMoveDay: (delta: number) => void, scrollYRef: RefObject<number>) {
  const pagerRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [neighborOffset, setNeighborOffset] = useState(0);
  const pendingJumpRef = useRef<number | null>(null);
  const jumpTargetXRef = useRef(0);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
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
    if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = null;
    setPendingJump(null);
    onMoveDay(delta);
    pagerRef.current?.scrollTo({ x: pageWidth, animated: false });
  };

  const goToday = () => {
    if (pendingJumpRef.current !== null) return;
    if (!pageWidth) {
      onMoveDay(-dayOffset);
      return;
    }
    pendingJumpRef.current = -dayOffset;
    jumpTargetXRef.current = dayOffset > 0 ? 0 : pageWidth * 2;
    setPendingJump(-dayOffset);
    syncNeighborOffset();
    pagerRef.current?.scrollTo({ x: jumpTargetXRef.current, animated: true });
    jumpTimerRef.current = setTimeout(finishJump, JUMP_FALLBACK_MS);
  };

  const handlePagerBeginDrag = () => {
    draggingRef.current = true;
    syncNeighborOffset();
  };

  const handlePagerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pendingJumpRef.current === null) return;
    if (Math.abs(e.nativeEvent.contentOffset.x - jumpTargetXRef.current) < ARRIVE_TOLERANCE_PX) finishJump();
  };

  const handlePagerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth || !draggingRef.current || pendingJumpRef.current !== null) return;
    draggingRef.current = false;
    const page = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (page !== 1) onMoveDay(page - 1);
    pagerRef.current?.scrollTo({ x: pageWidth, animated: false });
  };

  return { pagerRef, pageWidth, setPageWidth, neighborOffset, neighborDeltas, goToday, handlePagerBeginDrag, handlePagerScroll, handlePagerEnd };
}
