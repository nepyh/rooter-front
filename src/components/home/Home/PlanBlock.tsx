import { useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector, type NativeGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { PlanBlockText } from "./PlanBlockText";
import { columnStyle } from "./styles";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import { snapPlanStart, type Plan, type PlanStatus } from "@/utils/home/timeline";

// ================================
// Types
// ================================

type PlanTextFit = "full" | "title" | "none";

// ================================
// Constants
// ================================

const PLAN_TEXT_PADDING = 12;
const PLAN_TEXT_LEFT = 16;
const PLAN_TEXT_RIGHT = 4;
const LONG_PRESS_MS = 500;
const DRAG_START_DISTANCE = 8;
const DROP_TIMING = { duration: 120 };

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
  isDragging: boolean;
  draggable: boolean;
  scrollGestures: NativeGesture[];
  onPress: () => void;
  onLongPress: () => void;
  onDragStart: () => void;
  onDrop: (start: number) => void;
}

/**
 * 타임라인의 계획 블록. 글자가 블록보다 길면 시간 줄 → 제목 순으로 숨김
 * 완료는 흐리게, 실패는 붉은 톤으로 표시
 * 꾹 누르면 그림자가 생기고 상하좌우로 자유롭게 끌어 옮길 수 있음. 그림자가 있는 동안은 꾹 누르지 않고 바로 끌 수 있음
 * 끄는 동안 감싼 ScrollView 들은 스크롤되지 않음. 놓으면 세로 위치로 시작 시각을 정해 SNAP_MIN 단위로 맞추고, 가로는 칸 자리로 돌아감
 * @param plan 그릴 계획
 * @param column 겹치는 계획 사이에서 몇 번째 칸인지 (0부터)
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param areaWidth 블록을 놓는 영역의 너비(px)
 * @param isActive 꾹 눌러 옮길 준비가 된 상태인지 (진한 배경·그림자·위아래 손잡이로 표시하고 세로 막대는 숨김)
 * @param isDragging 이 블록을 끌고 있는지, 끄는 동안에는 위아래 손잡이를 숨김
 * @param draggable 꾹 누르기·끌기를 받을지 (완료·실패한 계획은 false)
 * @param scrollGestures 끄는 동안 막을 ScrollView 제스처들
 * @param onPress 블록을 짧게 눌렀을 때 호출 (옮길 준비가 된 블록은 호출하지 않음)
 * @param onLongPress 블록을 꾹 눌렀을 때 호출
 * @param onDragStart 손가락을 움직여 끌기 시작했을 때 호출
 * @param onDrop 끌던 블록을 놓았을 때 맞춰진 시작 위치(분)와 함께 호출
 */
export function PlanBlock({
  plan,
  column,
  columns,
  areaWidth,
  isActive,
  isDragging,
  draggable,
  scrollGestures,
  onPress,
  onLongPress,
  onDragStart,
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

  const { left, ...columnSize } = columnStyle(column, columns, areaWidth);

  const startX = useSharedValue(left);
  const startY = useSharedValue(plan.start);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragging = useSharedValue(false);

  useEffect(() => {
    startX.set(withTiming(left, DROP_TIMING));
  }, [left, startX]);

  useEffect(() => {
    startY.set(plan.start);
  }, [plan.start, startY]);

  const positionStyle = useAnimatedStyle(() => ({
    left: startX.get() + dragX.get(),
    top: startY.get() + dragY.get(),
  }));

  const dragGesture = Gesture.Pan()
    .enabled(draggable)
    .activateAfterLongPress(isActive ? 0 : LONG_PRESS_MS)
    .blocksExternalGesture(...scrollGestures)
    .onStart(() => {
      if (!isActive) scheduleOnRN(onLongPress);
    })
    .onUpdate((e) => {
      dragX.set(e.translationX);
      dragY.set(e.translationY);
      if (!dragging.get() && Math.hypot(e.translationX, e.translationY) > DRAG_START_DISTANCE) {
        dragging.set(true);
        scheduleOnRN(onDragStart);
      }
    })
    .onEnd(() => {
      if (!dragging.get()) {
        dragX.set(0);
        dragY.set(0);
        return;
      }
      const dropped = startY.get() + dragY.get();
      const next = snapPlanStart(dropped, plan.duration);
      startX.set(startX.get() + dragX.get());
      startY.set(dropped);
      dragX.set(0);
      dragY.set(0);
      startX.set(withTiming(left, DROP_TIMING));
      startY.set(withTiming(next, DROP_TIMING));
      dragging.set(false);
      scheduleOnRN(onDrop, next);
    });
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
        { position: "absolute", height: plan.duration, zIndex: isActive ? 1 : 0, ...columnSize },
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
          {isActive && !isDragging && (
            <>
              <View pointerEvents="none" className="absolute -top-spacing-2 inset-x-spacing-0 items-center z-10">
                <View className="w-spacing-11 h-spacing-3 rounded-radius-1 border border-neutral-100" style={{ backgroundColor: colors.muted }} />
              </View>
              <View pointerEvents="none" className="absolute -bottom-spacing-2 inset-x-spacing-0 items-center z-10">
                <View className="w-spacing-11 h-spacing-3 rounded-radius-1 border border-neutral-100" style={{ backgroundColor: colors.muted }} />
              </View>
            </>
          )}
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
