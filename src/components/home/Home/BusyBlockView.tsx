import { useEffect, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector, type GestureType } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { CollapsedDots } from "./CollapsedDots";
import { BLOCK_MEASURE_STYLE, BLOCK_TEXT_PADDING, MUTED_TEXT_COLOR, columnStyle } from "./styles";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import { useAnimatedColumn } from "@/hooks/home/useAnimatedColumn";
import type { AutoScroll } from "@/hooks/home/useAutoScroll";
import { formatDuration, snapBusyDrag, toClockString, type BusyBlock, type BusyEdit } from "@/utils/home/timeline";

// ================================
// Types
// ================================

type BusyKind = "sleep" | "school";

// ================================
// Constants
// ================================

const LONG_PRESS_MS = 500;

// ================================
// Styles
// ================================

const busyColors: Record<BusyKind, { bar: string; bg: string; focus: string }> = {
  "sleep": { bar: color.busy["sleep-bar"], bg: color.busy["sleep-bg"], focus: color.busy["sleep-focus"] },
  "school": { bar: color.busy["school-bar"], bg: color.busy["school-bg"], focus: color.busy["school-focus"] },
};

/** 끄는 동안 시간 줄에 보여줄 문구. 수면은 움직이는 쪽 시각만, 식사는 새 시작·종료 시각 */
const dragLabels: Record<BusyEdit["edge"], (start: number, duration: number) => string> = {
  "top": (start) => `취침 ${toClockString(start)}`,
  "bottom": (start, duration) => `기상 ${toClockString(start + duration)}`,
  "move": (start, duration) => `${toClockString(start)} - ${toClockString(start + duration)} | ${formatDuration(duration)}`,
};

// ================================
// Components
// ================================

interface Props {
  block: BusyBlock;
  column: number;
  columns: number;
  areaWidth: number;
  scrollGestures?: GestureType[];
  autoScroll?: AutoScroll;
  onPress?: () => void;
  onDrop?: (block: BusyBlock, start: number, duration: number) => void;
}

/**
 * 수면·학교·불가능 시간 블록
 * 수면·식사 블록(block.edit 이 있는 블록)은 꾹 눌러 위아래로 끌 수 있음. 수면은 자정 반대쪽 끝만, 식사는 블록 전체가 SNAP_MIN 단위로 움직임
 * 끄는 동안 시간 줄에 새 시각을 보여주고, 놓으면 onDrop 으로 새 위치를 알림 (저장은 바깥에서 확인 후)
 * 일정을 끄는 동안 칸 배치가 바뀌면 새 자리로 부드럽게 옮겨감
 * 블록이 낮아 제목이 들어가지 않으면 focus 색 점 세 개로 축약 표시
 * @param block 그릴 블록 (key 앞부분으로 수면·학교 색을 정하고, 나머지는 기본 회색)
 * @param column 겹치는 블록 사이에서 몇 번째 칸인지 (0부터)
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param areaWidth 블록을 놓는 영역의 너비(px)
 * @param scrollGestures 끄는 동안 막을 ScrollView 제스처들
 * @param autoScroll 끄다가 손가락이 위·아래 끝에 가까워지면 타임라인을 저절로 스크롤하는 도구
 * @param onPress 옮길 수 있는 블록을 누르거나 꾹 눌렀을 때 호출 (열린 계획 액션 메뉴를 닫을 때 씀)
 * @param onDrop 끌던 블록을 놓았을 때 새 시작 위치·길이(분)와 함께 호출, 없으면 끌 수 없음 (옆 날짜 미리보기)
 */
export function BusyBlockView({ block, column, columns, areaWidth, scrollGestures = [], autoScroll, onPress, onDrop }: Props) {
  const kind = block.key.split("-")[0];
  const colors = kind === "sleep" || kind === "school" ? busyColors[kind] : CATEGORY_COLORS.neutral;
  const edge = onDrop && autoScroll ? block.edit?.edge : undefined;

  const [dragPreview, setDragPreview] = useState<{ start: number; duration: number } | null>(null);
  const { left, width, ...columnPadding } = columnStyle(column, columns, areaWidth);
  const { x, width: animatedWidth } = useAnimatedColumn(left, width, dragPreview !== null);
  const top = useSharedValue(block.start);
  const height = useSharedValue(block.duration);
  const fingerY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const zero = useSharedValue(0);
  const scrollDelta = autoScroll?.scrollDelta ?? zero;

  useEffect(() => {
    top.set(block.start);
    height.set(block.duration);
  }, [block.start, block.duration, top, height]);

  const columnAnimatedStyle = useAnimatedStyle(() => ({
    left: x.get(),
    width: animatedWidth.get(),
    top: top.get(),
    height: height.get(),
  }));

  const followFinger = () => {
    "worklet";
    if (!dragging.get() || !edge) return;
    const next = snapBusyDrag(edge, block.start, block.duration, fingerY.get() + scrollDelta.get());
    if (next.start === top.get() && next.duration === height.get()) return;
    top.set(next.start);
    height.set(next.duration);
    scheduleOnRN(setDragPreview, next);
  };

  useAnimatedReaction(
    () => scrollDelta.get(),
    (current, previous) => {
      if (current !== previous) followFinger();
    },
  );

  const handleDrop = (start: number, duration: number) => {
    setDragPreview(null);
    onDrop?.(block, start, duration);
  };

  const dragGesture = Gesture.Pan()
    .enabled(!!edge)
    .activateAfterLongPress(LONG_PRESS_MS)
    .blocksExternalGesture(...scrollGestures)
    .onStart(() => {
      fingerY.set(0);
      dragging.set(true);
      autoScroll?.begin();
      if (onPress) scheduleOnRN(onPress);
      scheduleOnRN(setDragPreview, { start: block.start, duration: block.duration });
    })
    .onUpdate((e) => {
      fingerY.set(e.translationY);
      autoScroll?.update(e.absoluteY);
      followFinger();
    })
    .onEnd(() => {
      autoScroll?.end();
      dragging.set(false);
      scheduleOnRN(handleDrop, top.get(), height.get());
    });

  const tapGesture = Gesture.Tap()
    .enabled(!!edge)
    .runOnJS(true)
    .onEnd((_, success) => {
      if (success) onPress?.();
    });
  const gesture = Gesture.Race(dragGesture, tapGesture);

  const lifted = dragPreview !== null;
  const timeLabel = lifted && edge ? dragLabels[edge](dragPreview.start, dragPreview.duration) : block.label;

  const [titleHeight, setTitleHeight] = useState<number | null>(null);
  const measured = titleHeight !== null;
  const shownDuration = dragPreview?.duration ?? block.duration;
  const showText = titleHeight === null || titleHeight <= shownDuration - BLOCK_TEXT_PADDING;

  const content = (
    <Animated.View
      pointerEvents={edge ? "auto" : "none"}
      style={[{ position: "absolute", zIndex: lifted ? 1 : 0, ...columnPadding }, columnAnimatedStyle]}
    >
      <View
        style={{ flex: 1, backgroundColor: lifted ? colors.focus : colors.bg }}
        className={`flex-row gap-spacing-3 p-spacing-2 rounded-radius-1 overflow-hidden ${lifted ? "border border-neutral-100" : ""}`}
      >
        <View className="w-spacing-2 h-full rounded-radius-full" style={{ backgroundColor: colors.bar }} />
        <View className="flex-1 py-spacing-1" style={{ opacity: measured ? 1 : 0 }}>
          {showText ? (
            <Stack gap="xs">
              <Text variant="base-small" weight="medium">{block.title}</Text>
              {(lifted || shownDuration >= 40) && (
                <Row gap="xs" className="items-center">
                  <Icon name="history" size={12} color={MUTED_TEXT_COLOR} />
                  <Text variant="base-caption" style={{ color: MUTED_TEXT_COLOR }}>{timeLabel}</Text>
                </Row>
              )}
            </Stack>
          ) : (
            <CollapsedDots color={colors.focus} />
          )}
        </View>
        <View style={BLOCK_MEASURE_STYLE}>
          <Text
            variant="base-small"
            weight="medium"
            onLayout={(e) => setTitleHeight(e.nativeEvent.layout.height)}
          >
            {block.title}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return edge ? <GestureDetector gesture={gesture}>{content}</GestureDetector> : content;
}
