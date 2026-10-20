import { useEffect, useRef } from "react";
import type { ScrollView } from "react-native";
import { POPOVER_HEIGHT, TIMELINE_HEIGHT, minutesSinceWindowStart, type Plan } from "@/utils/home/timeline";

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
 * 처음 열면 현재 시각 조금 위로 스크롤하고, 액션 메뉴가 화면 밖에 뜨면 메뉴가 가운데 오도록 스크롤합니다.
 * @param now 현재 시각
 * @returns scrollRef, scrollYRef, handleScrollY, handleViewportHeight, revealMenu
 */
export function useTimelineScroll(now: Date) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const viewportHeightRef = useRef(0);

  useEffect(() => {
    const offset = Math.max(0, minutesSinceWindowStart(now) - INITIAL_SCROLL_ABOVE_NOW);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: offset, animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollY = (y: number) => {
    scrollYRef.current = y;
  };

  const handleViewportHeight = (height: number) => {
    viewportHeightRef.current = height;
  };

  const revealMenu = (plan: Plan) => {
    const viewportHeight = viewportHeightRef.current;
    if (!viewportHeight) return;

    const showBelow = plan.start < POPOVER_HEIGHT + MENU_GAP;
    const menuTop = showBelow ? plan.start + plan.duration + MENU_GAP : plan.start - POPOVER_HEIGHT - MENU_GAP;
    const menuBottom = menuTop + POPOVER_HEIGHT;

    const visibleTop = scrollYRef.current;
    const visibleBottom = visibleTop + viewportHeight;
    if (menuTop >= visibleTop && menuBottom <= visibleBottom) return;

    const centerTarget = menuTop + POPOVER_HEIGHT / 2 - viewportHeight / 2;
    const targetY = Math.max(0, Math.min(TIMELINE_HEIGHT - viewportHeight, centerTarget));
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  };

  return { scrollRef, scrollYRef, handleScrollY, handleViewportHeight, revealMenu };
}
