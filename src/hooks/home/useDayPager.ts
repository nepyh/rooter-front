import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Platform, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { scrollTo, useAnimatedRef } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { SWIPE_ACTIVE_X, SWIPE_FAIL_Y, SWIPE_FLING_VELOCITY, SWIPE_PAGE_RATIO } from "@/constants/swipe";

// ================================
// Constants
// ================================

const JUMP_FALLBACK_MS = 1000;
const ARRIVE_TOLERANCE_PX = 1;

/**
 * Android 는 가로 ScrollView 가 x 이동이 터치 슬롭만 넘으면 y 이동과 상관없이 터치를 가로채서,
 * 세로로 살짝 비스듬히 밀어도 날짜 페이지가 끌려가고 세로 스크롤이 안 됨 (#309).
 * 그래서 Android 에서만 가로 ScrollView 의 손 스크롤을 끄고, 방향을 가리는 Pan 으로 넘깁니다.
 */
const USE_SWIPE_GESTURE = Platform.OS === "android";

// ================================
// Hooks
// ================================

/**
 * useDayPager — 홈 타임라인을 좌우로 넘겨 날짜를 바꾸는 가로 페이지(어제 | 오늘 | 내일) 관리
 * iOS 는 세로 ScrollView 가 터치를 먼저 가져가 JS 제스처가 끊겨서, 네이티브 페이지 스크롤로 처리합니다.
 * Android 는 네이티브 페이지 스크롤이 세로 스와이프까지 가로채서, 손 스크롤을 끄고 가로 Pan(pagerGesture)으로 넘깁니다.
 * [오늘로] 이동과 Android 의 손 넘기기는 스크롤 위치가 목표 페이지에 닿았을 때 마무리하고, 스크롤이 끝난 이벤트로는 iOS 에서 손으로 넘겼을 때만 날짜를 바꿉니다.
 * 코드로 굴린 스크롤의 끝 이벤트는 플랫폼마다 늦게 오거나 안 와서, 그걸로 페이지를 세면 날짜가 한 번 더 바뀌기 때문입니다.
 * @param dayOffset 오늘 기준 며칠 떨어진 날을 보고 있는지 (0 이 오늘)
 * @param onMoveDay 날짜를 delta 만큼 옮길 때 호출
 * @param scrollYRef 세로 타임라인의 현재 스크롤 위치, 옆 페이지 눈금을 같은 높이로 맞출 때 씀
 * @returns pagerRef, pagerGesture(가로 ScrollView 를 감쌀 제스처), pagerScrollEnabled(가로 ScrollView 손 스크롤 여부), pageWidth, setPageWidth, neighborOffset, neighborDeltas(옆 페이지가 지금 날짜에서 며칠 떨어졌는지, 이동 중에는 목적지), goToday, handlePagerBeginDrag, handlePagerScroll, handlePagerEnd
 */
export function useDayPager(dayOffset: number, onMoveDay: (delta: number) => void, scrollYRef: RefObject<number>) {
  const pagerRef = useAnimatedRef<ScrollView>();
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

  /**
   * 옆 페이지로 굴려 보낸 뒤, 도착하면(handlePagerScroll) 날짜를 delta 만큼 옮김
   * @param delta 옮길 날짜 수, 음수면 이전 날짜 쪽
   */
  const jumpBy = (delta: number) => {
    pendingJumpRef.current = delta;
    jumpTargetXRef.current = delta < 0 ? 0 : pageWidth * 2;
    setPendingJump(delta);
    pagerRef.current?.scrollTo({ x: jumpTargetXRef.current, animated: true });
    jumpTimerRef.current = setTimeout(finishJump, JUMP_FALLBACK_MS);
  };

  const goToday = () => {
    if (pendingJumpRef.current !== null) return;
    if (!pageWidth) {
      onMoveDay(-dayOffset);
      return;
    }
    syncNeighborOffset();
    jumpBy(-dayOffset);
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

  /**
   * Android 가로 Pan 을 놓았을 때: delta 가 0 이면 제자리로 돌려놓고, 아니면 그쪽 페이지로 넘김
   * @param delta -1(이전 날) / 0(제자리) / 1(다음 날)
   */
  const settleSwipe = (delta: number) => {
    if (pendingJumpRef.current !== null) return;
    if (delta === 0) {
      pagerRef.current?.scrollTo({ x: pageWidth, animated: true });
      return;
    }
    jumpBy(delta);
  };

  // 제스처는 pageWidth 가 바뀔 때만 새로 만들고, JS 콜백은 최신 렌더의 것을 ref 로 부름
  const swipeHandlersRef = useRef({ begin: syncNeighborOffset, settle: settleSwipe });
  useLayoutEffect(() => {
    swipeHandlersRef.current = { begin: syncNeighborOffset, settle: settleSwipe };
  });

  const pagerGesture = useMemo(() => {
    if (!USE_SWIPE_GESTURE) return Gesture.Native();
    const begin = () => swipeHandlersRef.current.begin();
    const settle = (delta: number) => swipeHandlersRef.current.settle(delta);
    const scrollPager = (x: number) => {
      "worklet";
      scrollTo(pagerRef, x, 0, false);
    };
    return Gesture.Pan()
      .enabled(pageWidth > 0)
      .activeOffsetX([-SWIPE_ACTIVE_X, SWIPE_ACTIVE_X])
      .failOffsetY([-SWIPE_FAIL_Y, SWIPE_FAIL_Y])
      .onStart(() => {
        scheduleOnRN(begin);
      })
      .onUpdate((e) => {
        scrollPager(Math.min(Math.max(pageWidth - e.translationX, 0), pageWidth * 2));
      })
      .onEnd((e) => {
        let delta = 0;
        if (Math.abs(e.velocityX) > SWIPE_FLING_VELOCITY) delta = e.velocityX < 0 ? 1 : -1;
        else if (Math.abs(e.translationX) > pageWidth * SWIPE_PAGE_RATIO) delta = e.translationX < 0 ? 1 : -1;
        scheduleOnRN(settle, delta);
      });
  }, [pageWidth, pagerRef]);

  return {
    pagerRef,
    pagerGesture,
    pagerScrollEnabled: !USE_SWIPE_GESTURE,
    pageWidth,
    setPageWidth,
    neighborOffset,
    neighborDeltas,
    goToday,
    handlePagerBeginDrag,
    handlePagerScroll,
    handlePagerEnd,
  };
}
