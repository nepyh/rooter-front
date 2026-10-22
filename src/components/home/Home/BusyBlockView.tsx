import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { MUTED_TEXT_COLOR, columnStyle } from "./styles";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import { color } from "@/constants/token/color";
import { useAnimatedColumn } from "@/hooks/home/useAnimatedColumn";
import type { BusyBlock } from "@/utils/home/timeline";

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
  column: number;
  columns: number;
  areaWidth: number;
}

/**
 * 수면·학교·불가능 시간 블록. 누를 수 없음
 * 일정을 끄는 동안 칸 배치가 바뀌면 새 자리로 부드럽게 옮겨감
 * @param block 그릴 블록 (key 앞부분으로 수면·학교 색을 정하고, 나머지는 기본 회색)
 * @param column 겹치는 블록 사이에서 몇 번째 칸인지 (0부터)
 * @param columns 겹치는 묶음의 전체 칸 수
 * @param areaWidth 블록을 놓는 영역의 너비(px)
 */
export function BusyBlockView({ block, column, columns, areaWidth }: Props) {
  const kind = block.key.split("-")[0];
  const colors = kind === "sleep" || kind === "school" ? busyColors[kind] : CATEGORY_COLORS.neutral;

  const { left, width, ...columnPadding } = columnStyle(column, columns, areaWidth);
  const { x, width: animatedWidth } = useAnimatedColumn(left, width);
  const columnAnimatedStyle = useAnimatedStyle(() => ({ left: x.get(), width: animatedWidth.get() }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", top: block.start, height: block.duration, ...columnPadding }, columnAnimatedStyle]}
    >
      <View
        style={{ flex: 1, backgroundColor: colors.bg }}
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
    </Animated.View>
  );
}
