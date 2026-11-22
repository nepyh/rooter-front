import { Pressable, type AccessibilityState } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon, type IconName } from "@/assets";
import type { ChapterTree } from "@/api/home/common/catalog";
import { flattenLeaves, getLeafSelection, sortByChapterOrder, type LeafSelection } from "@/utils/home/chapter";

// ================================
// Constants
// ================================

const groupChecked: Record<LeafSelection, AccessibilityState["checked"]> = {
  "all": true,
  "some": "mixed",
  "none": false,
};

// ================================
// Types
// ================================

type LeafState = "selected" | "unselected";

// ================================
// Styles
// ================================

const leafStyles: Record<LeafState, string> = {
  "selected": "bg-neutral-600",
  "unselected": "",
};

const groupIcons: Record<LeafSelection, IconName | null> = {
  "all": "check",
  "some": "minus",
  "none": null,
};

// ================================
// Components
// ================================

interface Props {
  node: ChapterTree;
  depth: number;
  selectedIds: Set<number>;
  onToggleLeaves: (ids: number[]) => void;
}

/**
 * 목차 한 칸. 자식이 없으면 고를 수 있는 소단원, 자식이 있으면 중단원 라벨과 그 아래 목차를 그림
 * 중단원을 누르면 아래 소단원을 모두 고르고, 모두 골라져 있으면 모두 품. 일부만 골랐으면 빼기 아이콘을 보여줌
 * @param node 그릴 목차
 * @param depth 대단원 기준 깊이 (0 이 대단원)
 * @param selectedIds 고른 소단원 id
 * @param onToggleLeaves 소단원이나 중단원을 눌렀을 때 그 아래 소단원 id 들로 호출
 */
export function ChapterNode({ node, depth, selectedIds, onToggleLeaves }: Props) {
  if (node.children.length === 0) {
    const selected = selectedIds.has(node.id);
    return (
      <Pressable
        onPress={() => onToggleLeaves([node.id])}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        className={`flex-row items-center gap-spacing-4 px-spacing-5 py-spacing-4 rounded-radius-2 w-full ${leafStyles[selected ? "selected" : "unselected"]}`}
      >
        {selected && <Icon name="check" size={20} />}
        <Text variant="base-large" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
      </Pressable>
    );
  }

  const leafIds = flattenLeaves(node.children).map((leaf) => leaf.id);
  const selection = getLeafSelection(leafIds, selectedIds);
  const groupIcon = groupIcons[selection];

  return (
    <Stack gap="xs" width="full">
      <Pressable
        onPress={() => onToggleLeaves(leafIds)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: groupChecked[selection] }}
        className="flex-row items-center gap-spacing-4 w-full"
      >
        {groupIcon && <Icon name={groupIcon} size={20} />}
        <Text variant={depth === 0 ? "header-large" : "base-large"} weight={depth === 0 ? "semibold" : "medium"} className="text-text-primary" style={{ flex: 1 }}>
          {node.chapterName}
        </Text>
      </Pressable>
      <Stack gap="xxs" width="full">
        {sortByChapterOrder(node.children).map((child) => (
          <ChapterNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleLeaves={onToggleLeaves} />
        ))}
      </Stack>
    </Stack>
  );
}
