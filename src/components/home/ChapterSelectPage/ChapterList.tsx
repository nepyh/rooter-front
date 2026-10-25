import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { TopLevelAccordion } from "./TopLevelAccordion";
import { FadeScrollView } from "../common/FadeScrollView";
import type { TextbookDetail } from "@/api/home/common/catalog";
import { sortByChapterOrder } from "@/utils/home/chapter";
import { getSpacing } from "@/utils/common/token";

// ================================
// Constants
// ================================

const CHAPTER_FADE_HEIGHT = 140;

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookDetail[];
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}

/**
 * 교과서별 대단원 목록. 아래로 더 스크롤할 수 있으면 하단을 흐리게 덮어 더 있다는 걸 보여줌
 * @param textbooks 목차를 보여줄 교과서들 (여러 권이면 교과서 제목으로 구역을 나눔)
 * @param expandedIds 펼친 대단원 id
 * @param onToggleExpand 대단원을 펼치거나 접을 때 호출
 * @param selectedIds 고른 소단원 id
 * @param onToggleLeaf 소단원을 눌렀을 때 호출
 */
export function ChapterList({ textbooks, expandedIds, onToggleExpand, selectedIds, onToggleLeaf }: Props) {
  return (
    <FadeScrollView
      fadeHeight={CHAPTER_FADE_HEIGHT}
      contentContainerStyle={{ paddingBottom: getSpacing("spacing-9"), gap: getSpacing("spacing-7") }}
    >
      {textbooks.map((textbook) => (
        <Stack key={textbook.id} gap="m" width="full">
          {textbooks.length > 1 && (
            <Text variant="header-medium" weight="semibold" color="secondary" className="pt-spacing-3">{textbook.title}</Text>
          )}
          {sortByChapterOrder(textbook.chapters).map((node) => (
            <TopLevelAccordion
              key={node.id}
              node={node}
              expanded={expandedIds.has(node.id)}
              onToggle={() => onToggleExpand(node.id)}
              selectedIds={selectedIds}
              onToggleLeaf={onToggleLeaf}
            />
          ))}
        </Stack>
      ))}
    </FadeScrollView>
  );
}
