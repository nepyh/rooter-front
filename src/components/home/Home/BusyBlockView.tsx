import { View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { MUTED_TEXT_COLOR } from "./styles";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import { TIMELINE_LEFT, type BusyBlock } from "@/utils/home/timeline";

// ================================
// Types
// ================================

type BusyKind = "sleep" | "school";

// ================================
// Styles
// ================================

const busyColors: Record<BusyKind, { bar: string; bg: string }> = {
  "sleep": { bar: color.busy["sleep-bar"], bg: color.busy["sleep-bg"] },
  "school": { bar: color.busy["school-bar"], bg: color.busy["school-bg"] },
};

// ================================
// Components
// ================================

interface Props {
  block: BusyBlock;
}

/**
 * 수면·학교·불가능 시간 블록. 누를 수 없음
 * @param block 그릴 블록 (key 앞부분으로 수면·학교 색을 정하고, 나머지는 기본 회색)
 */
export function BusyBlockView({ block }: Props) {
  const kind = block.key.split("-")[0];
  const colors = kind === "sleep" || kind === "school" ? busyColors[kind] : CATEGORY_COLORS.neutral;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: block.start, left: TIMELINE_LEFT, right: 0, height: block.duration, backgroundColor: colors.bg }}
      className="flex-row gap-spacing-3 p-spacing-2 rounded-radius-1 overflow-hidden"
    >
      <View className="w-spacing-2 h-full rounded-radius-full" style={{ backgroundColor: colors.bar }} />
      <Stack gap="xs" className="flex-1 py-spacing-1">
        <Text variant="base-small" weight="medium">{block.title}</Text>
        {block.duration >= 40 && (
          <Row gap="xs" className="items-center">
            <Icon name="history" size={12} color={MUTED_TEXT_COLOR} />
            <Text variant="base-caption" style={{ color: MUTED_TEXT_COLOR }}>{block.label}</Text>
          </Row>
        )}
      </Stack>
    </View>
  );
}
