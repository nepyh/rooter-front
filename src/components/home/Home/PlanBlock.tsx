import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector, type NativeGesture } from "react-native-gesture-handler";
import { PlanBlockText } from "./PlanBlockText";
import { columnStyle } from "./styles";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import type { Plan, PlanStatus } from "@/utils/home/timeline";

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

// ================================
// Styles
// ================================

const statusOverrides: Partial<Record<PlanStatus, { bar: string; bg: string; opacity: number }>> = {
  "done": { bar: color.neutral["500"], bg: `${color.neutral["500"]}1F`, opacity: 0.55 },
  "failed": { bar: color.utility["error-primary"], bg: `${color.utility["error-primary"]}29`, opacity: 0.85 },
};

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  column: number;
  columns: number;
  scrollGestures: NativeGesture[];
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * 타임라인의 계획 블록. 글자가 블록보다 길면 시간 줄 → 제목 순으로 숨김
 * 완료는 흐리게, 실패는 붉은 톤으로 표시
 * 꾹 누르면 손가락을 뗄 때까지 감싼 ScrollView 들이 스크롤되지 않음
 * @param plan 그릴 계획
 * @param column 겹치는 계획 사이에서 몇 번째 칸인지 (0부터)
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param scrollGestures 꾹 누른 동안 막을 ScrollView 제스처들
 * @param onPress 블록을 짧게 눌렀을 때 호출
 * @param onLongPress 블록을 꾹 눌렀을 때 호출
 */
export function PlanBlock({ plan, column, columns, scrollGestures, onPress, onLongPress }: Props) {
  const colors = CATEGORY_COLORS[plan.category];
  const override = statusOverrides[plan.status];
  const bar = override?.bar ?? colors.bar;
  const bg = override?.bg ?? colors.bg;
  const opacity = override?.opacity ?? 1;

  const [titleHeight, setTitleHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const available = plan.duration - PLAN_TEXT_PADDING;
  const measured = fullHeight > 0;
  const fit: PlanTextFit = fullHeight <= available ? "full" : titleHeight <= available ? "title" : "none";

  const holdGesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .blocksExternalGesture(...scrollGestures)
    .runOnJS(true)
    .onStart(onLongPress);
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((_, success) => {
      if (success) onPress();
    });
  const gesture = Gesture.Race(holdGesture, tapGesture);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: plan.start,
        height: plan.duration,
        ...columnStyle(column, columns),
      }}
    >
      <GestureDetector gesture={gesture}>
        <View
          style={{ flex: 1, backgroundColor: bg, opacity }}
          className="flex-row gap-spacing-3 p-spacing-2 rounded-radius-1 overflow-hidden"
        >
          <View className="w-spacing-2 h-full rounded-radius-full" style={{ backgroundColor: bar }} />
          <View className="flex-1 py-spacing-1" style={{ opacity: measured ? 1 : 0 }}>
            {fit !== "none" && <PlanBlockText plan={plan} showLines={fit === "full"} />}
          </View>
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: PLAN_TEXT_LEFT, right: PLAN_TEXT_RIGHT, opacity: 0 }}>
            <PlanBlockText plan={plan} showLines onTitleLayout={setTitleHeight} onLayout={setFullHeight} />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}
