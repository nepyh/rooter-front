import { useState } from "react";
import { View } from "react-native";
import { PlanBlockText } from "./PlanBlockText";
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
  isActive?: boolean;
}

/**
 * 계획 블록의 겉모습(배경·세로 막대·글자). 위치와 제스처는 감싸는 쪽에서 정함
 * 글자가 블록보다 길면 시간 줄 → 제목 순으로 숨김. 완료는 흐리게, 실패는 붉은 톤으로 표시
 * @param plan 그릴 계획
 * @param isActive 꾹 눌러 옮길 준비가 된 상태인지 (진한 배경·그림자로 표시하고 세로 막대는 숨김)
 */
export function PlanBlockCard({ plan, isActive = false }: Props) {
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

  return (
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
  );
}
