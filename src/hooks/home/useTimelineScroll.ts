import { useEffect, useRef, useState } from "react";
import type { ScrollView } from "react-native";
import { useAnimatedRef } from "react-native-reanimated";
import {
  FLOATING_ACTIONS_BOTTOM,
  POPOVER_HEIGHT,
  TIMELINE_BOTTOM_PADDING,
  TIMELINE_HEIGHT,
  minutesSinceWindowStart,
  type Plan,
} from "@/utils/home/timeline";

// ================================
// Constants
// ================================

const INITIAL_SCROLL_ABOVE_NOW = 260;
const MENU_GAP = 8;

// ================================
// Hooks
// ================================

/**
 * useTimelineScroll — 홈 세로 타임라인의 스크롤 위치 관리
 * 처음 열면 현재 시각 조금 위로 스크롤하고, 액션 메뉴가 화면 밖이나 아래 탭 뒤에 뜨면 메뉴가 가운데 오도록 스크롤합니다.
 * scrollRef 는 animated ref 라서 블록을 끌 때 UI 스레드에서 자동 스크롤(useAutoScroll)할 때도 함께 씁니다.
 * @param now 현재 시각
 * revealMenu 는 타임라인 배율(1분당 px)을 받아 메뉴 위치를 계산합니다.
 * @returns scrollRef, scrollYRef, handleScrollY, handleViewportHeight, revealMenu
 */
export function useTimelineScroll(now: Date) {
  const scrollRef = useAnimatedRef<ScrollView>();
  const scrollYRef = useRef(0);
  const viewportHeightRef = useRef(0);

  // 처음 연 시각 기준으로 한 번만 스크롤함. 이후 now 가 바뀌어도 다시 스크롤하지 않음
  const [initialOffset] = useState(() => Math.max(0, minutesSinceWindowStart(now) - INITIAL_SCROLL_ABOVE_NOW));

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: initialOffset, animated: false }));
  }, [scrollRef, initialOffset]);

  const handleScrollY = (y: number) => {
    scrollYRef.current = y;
  };

  const handleViewportHeight = (height: number) => {
    viewportHeightRef.current = height;
  };

  const revealMenu = (plan: Plan, scale: number) => {
    const viewportHeight = viewportHeightRef.current;
    if (!viewportHeight) return;

    const planTop = plan.start * scale;
    const planBottom = (plan.start + plan.duration) * scale;
    const showBelow = planTop < POPOVER_HEIGHT + MENU_GAP;
    const menuTop = showBelow ? planBottom + MENU_GAP : planTop - POPOVER_HEIGHT - MENU_GAP;
    const menuBottom = menuTop + POPOVER_HEIGHT;

    // 타임라인 아래쪽은 아래 탭이 덮고 있어 보이는 높이에서 뺌
    const visibleHeight = viewportHeight - FLOATING_ACTIONS_BOTTOM;
    const visibleTop = scrollYRef.current;
    const visibleBottom = visibleTop + visibleHeight;
    if (menuTop >= visibleTop && menuBottom <= visibleBottom) return;

    const centerTarget = menuTop + POPOVER_HEIGHT / 2 - visibleHeight / 2;
    const maxScrollY = TIMELINE_HEIGHT * scale + TIMELINE_BOTTOM_PADDING - viewportHeight;
    const targetY = Math.max(0, Math.min(maxScrollY, centerTarget));
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  };

  return { scrollRef, scrollYRef, handleScrollY, handleViewportHeight, revealMenu };
}
