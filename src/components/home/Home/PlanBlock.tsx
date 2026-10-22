import { useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector, type NativeGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { PlanBlockText } from "./PlanBlockText";
import { columnStyle } from "./styles";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import { useAnimatedColumn } from "@/hooks/home/useAnimatedColumn";
import type { AutoScroll } from "@/hooks/home/useAutoScroll";
import {
  SNAP_MIN,
  TIMELINE_HEIGHT,
  snapPlanStart,
  snapResizeBottom,
  snapResizeTop,
  type DragMode,
  type Plan,
  type PlanStatus,
} from "@/utils/home/timeline";

// ================================
// Types
// ================================

type PlanTextFit = "full" | "title" | "none";
type GestureMode = "idle" | "move" | "top" | "bottom";

// ================================
// Constants
// ================================

const PLAN_TEXT_PADDING = 12;
const PLAN_TEXT_LEFT = 16;
const PLAN_TEXT_RIGHT = 4;
const LONG_PRESS_MS = 500;
const DRAG_START_DISTANCE = 8;
const DROP_TIMING = { duration: 120 };
const HANDLE_HIT_SLOP = { vertical: 12, horizontal: 16 };

// ================================
// Styles
// ================================

const statusOverrides: Partial<Record<PlanStatus, { bar: string; bg: string; opacity: number }>> = {
  "done": { bar: color.neutral["500"], bg: `${color.neutral["500"]}1F`, opacity: 0.55 },
  "failed": { bar: color.utility["error-primary"], bg: `${color.utility["error-primary"]}29`, opacity: 0.85 },
};

const ACTIVE_SHADOW = [{ offsetX: 0, offsetY: 8, blurRadius: 24, color: `${color.neutral["1000"]}99` }];

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  column: number;
  columns: number;
  areaWidth: number;
  isActive: boolean;
  dragMode: DragMode | null;
  draggable: boolean;
  scrollGestures: NativeGesture[];
  autoScroll: AutoScroll;
  onPress: () => void;
  onLongPress: () => void;
  onDragStart: (mode: DragMode) => void;
  onDragMove: (start: number, duration: number) => void;
  onDrop: (start: number, duration: number) => void;
}

/**
 * 타임라인의 계획 블록. 글자가 블록보다 길면 시간 줄 → 제목 순으로 숨김
 * 완료는 흐리게, 실패는 붉은 톤으로 표시
 * 꾹 누르면 그림자가 생기고 상하좌우로 자유롭게 끌어 옮길 수 있음. 그림자가 있는 동안은 꾹 누르지 않고 바로 끌 수 있음
 * 그림자가 있는 동안 위아래 손잡이를 끌면 시작·종료 시각을 바꿀 수 있음 (최소 SNAP_MIN 분)
 * 끄는 동안 감싼 ScrollView 들은 스크롤되지 않음. 놓으면 SNAP_MIN 단위로 맞추고, 가로는 칸 자리로 돌아감
 * @param plan 그릴 계획
 * @param column 겹치는 계획 사이에서 몇 번째 칸인지 (0부터)
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param areaWidth 블록을 놓는 영역의 너비(px)
 * @param isActive 꾹 눌러 옮길 준비가 된 상태인지 (진한 배경·그림자·위아래 손잡이로 표시하고 세로 막대는 숨김)
 * @param dragMode 이 블록을 끄는 방식, 끌고 있지 않으면 null. 끄는 동안에는 칸 배치가 바뀌어도 크기를 유지하고, 옮기는 동안에는 손잡이를 숨김
 * @param draggable 꾹 누르기·끌기를 받을지 (완료·실패한 계획은 false)
 * @param scrollGestures 끄는 동안 막을 ScrollView 제스처들
 * @param autoScroll 끄다가 손가락이 위·아래 끝에 가까워지면 타임라인을 저절로 스크롤하는 도구 (스크롤한 만큼 블록 위치도 보정)
 * @param onPress 블록을 짧게 눌렀을 때 호출 (옮길 준비가 된 블록은 호출하지 않음)
 * @param onLongPress 블록을 꾹 눌렀을 때 호출
 * @param onDragStart 블록을 옮기거나 손잡이로 길이를 바꾸기 시작했을 때 호출
 * @param onDragMove 끄는 동안 지금 놓으면 들어갈 시작 위치·길이(분)가 SNAP_MIN 단위로 바뀔 때마다 호출
 * @param onDrop 놓았을 때 맞춰진 시작 위치·길이(분)와 함께 호출
 */
export function PlanBlock({
  plan,
  column,
  columns,
  areaWidth,
  isActive,
  dragMode,
  draggable,
  scrollGestures,
  autoScroll,
  onPress,
  onLongPress,
  onDragStart,
  onDragMove,
  onDrop,
}: Props) {
  const colors = CATEGORY_COLORS[plan.category];
  const override = statusOverrides[plan.status];
  const bar = override?.bar ?? colors.bar;
  const bg = override?.bg ?? (isActive ? colors.focus : colors.bg);
  const opacity = override?.opacity ?? 1;

  const [titleHeight, setTitleHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const available = plan.duration - PLAN_TEXT_PADDING;
  const measured = fullHeight > 0;
  const fit: PlanTextFit = fullHeight <= available ? "full" : titleHeight <= available ? "title" : "none";

  const { left, width, ...columnPadding } = columnStyle(column, columns, areaWidth);

  const { x: startX, width: animatedWidth } = useAnimatedColumn(left, width, dragMode !== null);
  const startY = useSharedValue(plan.start);
  const height = useSharedValue(plan.duration);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const topDelta = useSharedValue(0);
  const bottomDelta = useSharedValue(0);
  const fingerY = useSharedValue(0);
  const gestureMode = useSharedValue<GestureMode>("idle");
  const dragging = useSharedValue(false);
  const previewStart = useSharedValue(plan.start);
  const previewDuration = useSharedValue(plan.duration);
  const { scrollDelta, begin: beginAutoScroll, update: updateAutoScroll, end: endAutoScroll } = autoScroll;

  useEffect(() => {
    startY.set(plan.start);
  }, [plan.start, startY]);

  useEffect(() => {
    height.set(plan.duration);
  }, [plan.duration, height]);

  const positionStyle = useAnimatedStyle(() => ({
    left: startX.get() + dragX.get(),
    top: startY.get() + dragY.get() + topDelta.get(),
    width: animatedWidth.get(),
    height: height.get() - topDelta.get() + bottomDelta.get(),
  }));

  const followFinger = () => {
    "worklet";
    const mode = gestureMode.get();
    if (mode === "idle") return;
    const y = fingerY.get() + scrollDelta.get();
    const top = startY.get();
    const h = height.get();
    let preview;
    if (mode === "move") {
      dragY.set(y);
      if (!dragging.get()) return;
      preview = { start: snapPlanStart(top + y, h), duration: h };
    } else if (mode === "top") {
      const delta = Math.min(Math.max(y, -top), h - SNAP_MIN);
      topDelta.set(delta);
      preview = snapResizeTop(top + delta, top + h);
    } else {
      const delta = Math.min(Math.max(y, SNAP_MIN - h), TIMELINE_HEIGHT - top - h);
      bottomDelta.set(delta);
      preview = snapResizeBottom(top, top + h + delta);
    }
    if (preview.start !== previewStart.get() || preview.duration !== previewDuration.get()) {
      previewStart.set(preview.start);
      previewDuration.set(preview.duration);
      scheduleOnRN(onDragMove, preview.start, preview.duration);
    }
  };

  useAnimatedReaction(
    () => scrollDelta.get(),
    (current, previous) => {
      if (current !== previous) followFinger();
    },
  );

  const dragGesture = Gesture.Pan()
    .enabled(draggable)
    .activateAfterLongPress(isActive ? 0 : LONG_PRESS_MS)
    .blocksExternalGesture(...scrollGestures)
    .onStart(() => {
      if (!isActive) scheduleOnRN(onLongPress);
      fingerY.set(0);
      gestureMode.set("move");
      beginAutoScroll();
    })
    .onUpdate((e) => {
      dragX.set(e.translationX);
      fingerY.set(e.translationY);
      if (!dragging.get() && Math.hypot(e.translationX, e.translationY) > DRAG_START_DISTANCE) {
        dragging.set(true);
        previewStart.set(startY.get());
        previewDuration.set(height.get());
        scheduleOnRN(onDragStart, "move");
      }
      if (dragging.get()) updateAutoScroll(e.absoluteY);
      followFinger();
    })
    .onEnd(() => {
      endAutoScroll();
      gestureMode.set("idle");
      if (!dragging.get()) {
        dragX.set(0);
        dragY.set(0);
        return;
      }
      const dropped = startY.get() + dragY.get();
      const next = snapPlanStart(dropped, height.get());
      startX.set(startX.get() + dragX.get());
      startY.set(dropped);
      dragX.set(0);
      dragY.set(0);
      startY.set(withTiming(next, DROP_TIMING));
      dragging.set(false);
      scheduleOnRN(onDrop, next, height.get());
    });

  const resizeGesture = (edge: "top" | "bottom") =>
    Gesture.Pan()
      .enabled(draggable && isActive)
      .minDistance(0)
      .hitSlop(HANDLE_HIT_SLOP)
      .blocksExternalGesture(dragGesture, ...scrollGestures)
      .onStart(() => {
        previewStart.set(startY.get());
        previewDuration.set(height.get());
        fingerY.set(0);
        gestureMode.set(edge);
        beginAutoScroll();
        scheduleOnRN(onDragStart, "resize");
      })
      .onUpdate((e) => {
        fingerY.set(e.translationY);
        updateAutoScroll(e.absoluteY);
        followFinger();
      })
      .onEnd(() => {
        endAutoScroll();
        gestureMode.set("idle");
        const top = startY.get();
        const h = height.get();
        if (topDelta.get() === 0 && bottomDelta.get() === 0) {
          scheduleOnRN(onDrop, top, h);
          return;
        }
        const next = edge === "top"
          ? snapResizeTop(top + topDelta.get(), top + h)
          : snapResizeBottom(top, top + h + bottomDelta.get());
        startY.set(top + topDelta.get());
        height.set(h - topDelta.get() + bottomDelta.get());
        topDelta.set(0);
        bottomDelta.set(0);
        startY.set(withTiming(next.start, DROP_TIMING));
        height.set(withTiming(next.duration, DROP_TIMING));
        scheduleOnRN(onDrop, next.start, next.duration);
      });
  const topHandleGesture = resizeGesture("top");
  const bottomHandleGesture = resizeGesture("bottom");
  const tapGesture = Gesture.Tap()
    .enabled(!isActive)
    .runOnJS(true)
    .onEnd((_, success) => {
      if (success) onPress();
    });
  const gesture = Gesture.Race(dragGesture, tapGesture);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        { position: "absolute", zIndex: isActive ? 1 : 0, ...columnPadding },
        positionStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View className="flex-1">
          <View className="flex-1 rounded-radius-1" style={isActive ? { boxShadow: ACTIVE_SHADOW } : undefined}>
            <View
              style={{ flex: 1, backgroundColor: bg, opacity }}
              className="flex-row gap-spacing-3 p-spacing-2 rounded-radius-1 overflow-hidden"
            >
              {!isActive && <View className="w-spacing-2 h-full rounded-radius-full" style={{ backgroundColor: bar }} />}
              <View className="flex-1 py-spacing-1" style={{ opacity: measured ? 1 : 0 }}>
                {fit !== "none" && <PlanBlockText plan={plan} showLines={fit === "full"} />}
              </View>
              <View pointerEvents="none" style={{ position: "absolute", top: 0, left: PLAN_TEXT_LEFT, right: PLAN_TEXT_RIGHT, opacity: 0 }}>
                <PlanBlockText plan={plan} showLines onTitleLayout={setTitleHeight} onLayout={setFullHeight} />
              </View>
            </View>
          </View>
          {isActive && dragMode !== "move" && (
            <>
              <View pointerEvents="box-none" className="absolute -top-spacing-2 inset-x-spacing-0 items-center z-10">
                <GestureDetector gesture={topHandleGesture}>
                  <View className="w-spacing-11 h-spacing-3 rounded-radius-1 border border-neutral-100" style={{ backgroundColor: colors.muted }} />
                </GestureDetector>
              </View>
              <View pointerEvents="box-none" className="absolute -bottom-spacing-2 inset-x-spacing-0 items-center z-10">
                <GestureDetector gesture={bottomHandleGesture}>
                  <View className="w-spacing-11 h-spacing-3 rounded-radius-1 border border-neutral-100" style={{ backgroundColor: colors.muted }} />
                </GestureDetector>
              </View>
            </>
          )}
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
