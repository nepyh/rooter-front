import { useState } from "react";
import { View } from "react-native";
import { CollapsedDots } from "./CollapsedDots";
import { PlanBlockText, type PlanLineLayout } from "./PlanBlockText";
import { BLOCK_MEASURE_STYLE, BLOCK_TEXT_PADDING } from "./styles";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import type { Plan, PlanStatus } from "@/utils/home/timeline";

// ================================
// Styles
// ================================

const statusOverrides: Partial<
  Record<PlanStatus, { bar: string; bg: string; focus: string; opacity: number }>
> = {
  "done": {
    bar: color.neutral["500"],
    bg: `${color.neutral["500"]}1F`,
    focus: `${color.neutral["500"]}66`,
    opacity: 0.55,
  },
  "failed": {
    bar: color.utility["error-primary"],
    bg: `${color.utility["error-primary"]}29`,
    focus: `${color.utility["error-primary"]}66`,
    opacity: 0.85,
  },
};

const ACTIVE_SHADOW = [
  {
    offsetX: 0,
    offsetY: 8,
    blurRadius: 24,
    color: `${color.neutral["1000"]}99`,
  },
];

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  isActive?: boolean;
}

/**
 * 계획 블록의 겉모습(배경·세로 막대·글자). 위치와 제스처는 감싸는 쪽에서 정함
 * 글자가 블록보다 길면 부가 줄을 한 줄로 나란히 → 부가 줄 숨김 → 제목 숨김 순으로 줄임. 제목까지 숨기면 focus 색 점 세 개로 축약 표시
 * 완료는 흐리게, 실패는 붉은 톤으로 표시
 * @param plan 그릴 계획
 * @param isActive 꾹 눌러 옮길 준비가 된 상태인지 (진한 배경·그림자로 표시하고 세로 막대는 숨김)
 */
export function PlanBlockCard({ plan, isActive = false }: Props) {
  const colors = CATEGORY_COLORS[plan.category];
  const override = statusOverrides[plan.status];
  const bar = override?.bar ?? colors.bar;
  const bg = override?.bg ?? (isActive ? colors.focus : colors.bg);
  const focus = override?.focus ?? colors.focus;
  const opacity = override?.opacity ?? 1;

  const [titleHeight, setTitleHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const available = plan.duration - BLOCK_TEXT_PADDING;
  const measured = fullHeight > 0 && rowHeight > 0;
  const lineLayout: PlanLineLayout =
    fullHeight <= available
      ? "column"
      : rowHeight <= available
        ? "row"
        : "none";
  const showText = titleHeight <= available;

  return (
    <View
      className="flex-1 rounded-radius-1"
      style={isActive ? { boxShadow: ACTIVE_SHADOW } : undefined}
    >
      <View
        style={{ flex: 1, backgroundColor: bg, opacity }}
        className="flex-row gap-spacing-3 overflow-hidden rounded-radius-1 p-spacing-2"
      >
        {!isActive && (
          <View
            className="h-full w-spacing-2 rounded-radius-full"
            style={{ backgroundColor: bar }}
          />
        )}
        <View
          className="flex-1 py-spacing-1"
          style={{ opacity: measured ? 1 : 0 }}
        >
          {showText ? (
            <PlanBlockText plan={plan} lineLayout={lineLayout} />
          ) : (
            <CollapsedDots color={focus} />
          )}
        </View>
        <View pointerEvents="none" style={BLOCK_MEASURE_STYLE}>
          <PlanBlockText
            plan={plan}
            lineLayout="column"
            onTitleLayout={setTitleHeight}
            onLayout={setFullHeight}
          />
        </View>
        <View pointerEvents="none" style={BLOCK_MEASURE_STYLE}>
          <PlanBlockText plan={plan} lineLayout="row" onLayout={setRowHeight} />
        </View>
      </View>
    </View>
  );
}
