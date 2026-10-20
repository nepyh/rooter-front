import { Pressable } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { ChapterTree } from "@/api/home/common/catalog";
import { sortByChapterOrder } from "@/utils/home/chapter";

// ================================
// Types
// ================================

type State = "selected" | "unselected";

// ================================
// Styles
// ================================

const leafStyles: Record<State, string> = {
  "selected": "bg-neutral-600",
  "unselected": "",
};

// ================================
// Components
// ================================

interface Props {
  node: ChapterTree;
  depth: number;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}

/**
 * 목차 한 칸. 자식이 없으면 고를 수 있는 소단원, 자식이 있으면 중단원 라벨과 그 아래 목차를 그림
 * @param node 그릴 목차
 * @param depth 대단원 기준 깊이 (0 이 대단원)
 * @param selectedIds 고른 소단원 id
 * @param onToggleLeaf 소단원을 눌렀을 때 호출
 */
export function ChapterNode({ node, depth, selectedIds, onToggleLeaf }: Props) {
  if (node.children.length === 0) {
    const selected = selectedIds.has(node.id);
    return (
      <Pressable
        onPress={() => onToggleLeaf(node.id)}
        className={`flex-row items-center gap-spacing-4 px-spacing-5 py-spacing-4 rounded-radius-2 w-full ${leafStyles[selected ? "selected" : "unselected"]}`}
      >
        {selected && <Icon name="check" size={20} />}
        <Text variant="base-large" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
      </Pressable>
    );
  }

  return (
    <Stack gap="xs" width="full">
      <Text variant={depth === 0 ? "header-large" : "base-large"} weight={depth === 0 ? "semibold" : "medium"} className="text-text-primary">
        {node.chapterName}
      </Text>
      <Stack gap="xxs" width="full">
        {sortByChapterOrder(node.children).map((child) => (
          <ChapterNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleLeaf={onToggleLeaf} />
        ))}
      </Stack>
    </Stack>
  );
}
