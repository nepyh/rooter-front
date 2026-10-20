import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { MUTED_TEXT_COLOR } from "./styles";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import type { Plan } from "@/utils/home/timeline";

// ================================
// Styles
// ================================

const FAILED_TITLE_STYLE = { textDecorationLine: "line-through" as const, color: color.utility["error-primary"] };

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  showLines: boolean;
  onTitleLayout?: (height: number) => void;
  onLayout?: (height: number) => void;
}

/**
 * 계획 블록 안의 제목과 시간 줄
 * @param plan 보여줄 계획
 * @param showLines 제목 아래 시간 줄까지 보여줄지
 * @param onTitleLayout 제목 줄 높이를 잰 뒤 호출
 * @param onLayout 전체 글자 영역 높이를 잰 뒤 호출
 */
export function PlanBlockText({ plan, showLines, onTitleLayout, onLayout }: Props) {
  return (
    <Stack gap="xs" onLayout={(e) => onLayout?.(e.nativeEvent.layout.height)}>
      <Row gap="xs" className="items-center" onLayout={(e) => onTitleLayout?.(e.nativeEvent.layout.height)}>
        {plan.status === "done" && <Icon name="check" size={12} color={color.neutral["0"]} />}
        {plan.status === "failed" && <Icon name="close" size={12} color={color.utility["error-primary"]} />}
        <Text variant="base-small" weight="medium" style={plan.status === "failed" ? FAILED_TITLE_STYLE : undefined}>
          {plan.title}
        </Text>
      </Row>
      {showLines && plan.lines.map((line, i) => (
        <Row key={i} gap="xs" className="items-center">
          <Icon name={line.icon} size={12} color={MUTED_TEXT_COLOR} />
          <Text variant="base-caption" style={{ color: MUTED_TEXT_COLOR }}>{line.text}</Text>
        </Row>
      ))}
    </Stack>
  );
}
