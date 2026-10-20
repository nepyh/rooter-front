import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Stack } from "@/components/layout";
import { Text } from "@/components/ui";
import { Icon } from "@/assets";
import { getTextbookDetail } from "@/api/catalog";
import type { ChapterTree } from "@/api/catalog";

// ================================
// Helpers
// ================================

const sortByOrder = (nodes: ChapterTree[]) => [...nodes].sort((a, b) => a.chapterOrder - b.chapterOrder);

// ================================
// Components
// ================================

// 자식이 없는 노드만 고를 수 있는 소단원, 자식이 있으면 대단원·중단원 라벨
function ChapterNode({ node, depth, selectedIds, onToggleLeaf }: {
  node: ChapterTree;
  depth: number;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}) {
  if (node.children.length === 0) {
    const selected = selectedIds.has(node.id);
    return (
      <Pressable
        onPress={() => onToggleLeaf(node.id)}
        className={`flex-row items-center gap-m px-l py-m rounded-xs w-full ${selected ? "bg-neutral-600" : ""}`}
      >
        {selected && <Icon name="check" size={20} />}
        <Text variant="base-large" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
      </Pressable>
    );
  }

  return (
    <Stack gap="xs" width="full">
      <Text variant={depth === 0 ? "header-large" : "base-large"} weight={depth === 0 ? "semibold" : "medium"}>
        {node.chapterName}
      </Text>
      <Stack gap="xxs" width="full">
        {sortByOrder(node.children).map((child) => (
          <ChapterNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleLeaf={onToggleLeaf} />
        ))}
      </Stack>
    </Stack>
  );
}

interface Props {
  textbookId: number;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  bottomInset?: number;
}

/**
 * 교과서 목차를 대단원별로 접고 펼치며 소단원을 고르는 목록
 * @param textbookId 목차를 불러올 교과서 ID를 입력합니다.
 * @param selectedIds 선택된 소단원 ID 목록을 설정합니다.
 * @param onToggle 소단원을 눌렀을 때 실행할 행동을 입력합니다.
 * @param bottomInset 목록 아래 여백(하단 버튼에 가리지 않게)을 설정합니다.
 */
export function ChapterPicker({ textbookId, selectedIds, onToggle, bottomInset = 96 }: Props) {
  const [chapters, setChapters] = useState<ChapterTree[]>([]);
  // 대단원은 여러 개 동시에 펼칠 수 있음
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getTextbookDetail(textbookId).then((detail) => setChapters(detail.chapters)).catch(() => setChapters([]));
  }, [textbookId]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset, gap: 12 }}>
      {sortByOrder(chapters).map((node) => {
        const expanded = expandedIds.has(node.id);
        return (
          <Stack key={node.id} width="full" className={expanded ? "bg-neutral-700 rounded-sm overflow-hidden" : ""}>
            <Pressable onPress={() => toggleExpanded(node.id)} className="flex-row items-center justify-between px-xl py-l w-full">
              <Text variant="header-large" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
              <View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}>
                <Icon name="chevronRight" size={28} />
              </View>
            </Pressable>
            {expanded && (
              <Stack gap="m" width="full" className="px-xl pt-l pb-m">
                {sortByOrder(node.children).map((child) => (
                  <ChapterNode key={child.id} node={child} depth={1} selectedIds={selectedIds} onToggleLeaf={onToggle} />
                ))}
              </Stack>
            )}
          </Stack>
        );
      })}
    </ScrollView>
  );
}
