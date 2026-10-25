import { Pressable, View } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { ChapterNode } from "./ChapterNode";
import { VerticalGradient } from "../common/VerticalGradient";
import { Icon } from "@/assets";
import type { ChapterTree } from "@/api/home/common/catalog";
import { sortByChapterOrder } from "@/utils/home/chapter";
import { color } from "@/constants/token/color";

// ================================
// Constants
// ================================

const CONTENT_SHADOW_END = 0.08446;

// ================================
// Types
// ================================

type State = "expanded" | "collapsed";

// ================================
// Styles
// ================================

const containerStyles: Record<State, string> = {
  "expanded": "bg-neutral-700 rounded-radius-3 overflow-hidden",
  "collapsed": "",
};

const headerStyles: Record<State, string> = {
  "expanded": "bg-neutral-700",
  "collapsed": "rounded-radius-3",
};

// ================================
// Components
// ================================

interface Props {
  node: ChapterTree;
  expanded: boolean;
  onToggle: () => void;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}

/**
 * 펼치고 접을 수 있는 대단원. 펼치면 안의 중단원·소단원이 모두 보임
 * @param node 대단원
 * @param expanded 펼친 상태인지
 * @param onToggle 대단원 제목을 눌렀을 때 호출
 * @param selectedIds 고른 소단원 id
 * @param onToggleLeaf 소단원을 눌렀을 때 호출
 */
export function TopLevelAccordion({ node, expanded, onToggle, selectedIds, onToggleLeaf }: Props) {
  const state: State = expanded ? "expanded" : "collapsed";

  return (
    <Stack width="full" className={containerStyles[state]}>
      <Pressable onPress={onToggle} className={`flex-row items-center justify-between px-spacing-6 py-spacing-5 w-full ${headerStyles[state]}`}>
        <Text variant="header-large" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
        <View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}>
          <Icon name="chevronRight" size={28} />
        </View>
      </Pressable>
      {expanded && (
        <Stack gap="m" width="full" className="px-spacing-6 pt-spacing-5 pb-spacing-4">
          <VerticalGradient
            stops={[
              { offset: 0, color: color.neutral["800"] },
              { offset: CONTENT_SHADOW_END, color: color.neutral["700"] },
            ]}
            className="absolute inset-spacing-0"
          />
          {sortByChapterOrder(node.children).map((child) => (
            <ChapterNode key={child.id} node={child} depth={1} selectedIds={selectedIds} onToggleLeaf={onToggleLeaf} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
