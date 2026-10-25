import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { MUTED_TEXT_COLOR } from "./styles";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import type { Plan } from "@/utils/home/timeline";

// ================================
// Types
// ================================

export type PlanLineLayout = "column" | "row" | "none";

// ================================
// Styles
// ================================

const FAILED_TITLE_STYLE = {
  textDecorationLine: "line-through" as const,
  color: color.utility["error-primary"],
};

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  lineLayout: PlanLineLayout;
  onTitleLayout?: (height: number) => void;
  onLayout?: (height: number) => void;
}

/**
 * 계획 블록 안의 제목(과목 이름, 직접 만든 일정은 입력한 제목)과 부가 줄(해야 할 일·시간)
 * @param plan 보여줄 계획
 * @param lineLayout 부가 줄 배치. column 은 제목 아래 한 줄씩, row 는 한 줄을 반씩 나눠 넘치면 말줄임, none 은 숨김
 * @param onTitleLayout 제목 줄 높이를 잰 뒤 호출
 * @param onLayout 전체 글자 영역 높이를 잰 뒤 호출
 */
export function PlanBlockText({
  plan,
  lineLayout,
  onTitleLayout,
  onLayout,
}: Props) {
  const inRow = lineLayout === "row";
  const lines = plan.lines.map((line, i) => (
    <Row key={i} gap="xs" className={`items-center ${inRow ? "flex-1" : ""}`}>
      <Icon name={line.icon} size={12} color={MUTED_TEXT_COLOR} />
      <Text
        variant="base-caption"
        className="shrink"
        numberOfLines={inRow ? 1 : undefined}
        style={{ color: MUTED_TEXT_COLOR }}
      >
        {line.text}
      </Text>
    </Row>
  ));

  return (
    <Stack gap="xs" onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}>
      <Row
        gap="xs"
        className="items-center"
        onLayout={(e) => onTitleLayout?.(e.nativeEvent.layout.height)}
      >
        {plan.status === "done" && (
          <Icon name="check" size={12} color={color.neutral["0"]} />
        )}
        {plan.status === "failed" && (
          <Icon name="close" size={12} color={color.utility["error-primary"]} />
        )}
        <Text
          variant="base-small"
          weight="medium"
          style={plan.status === "failed" ? FAILED_TITLE_STYLE : undefined}
        >
          {plan.subject ?? plan.title}
        </Text>
      </Row>
      {lineLayout === "column" && lines}
      {inRow && <Row>{lines}</Row>}
    </Stack>
  );
}
