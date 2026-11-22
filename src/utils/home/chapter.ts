import type { ChapterTree } from "@/api/home/common/catalog";
import type { PlanGenerationSubjectInput } from "@/api/home/common/planGeneration";

// ================================
// Types
// ================================

/**
 * 소단원 묶음이 골라진 정도
 * - all: 모두 고름
 * - some: 일부만 고름
 * - none: 하나도 안 고름
 */
export type LeafSelection = "all" | "some" | "none";

// ================================
// Functions
// ================================

/**
 * 목차를 chapterOrder 오름차순으로 정렬한 새 배열
 * @param nodes 정렬할 목차
 */
export const sortByChapterOrder = (nodes: ChapterTree[]) =>
  [...nodes].sort((a, b) => a.chapterOrder - b.chapterOrder);

/**
 * 화면에 그리는 순서(대단원 → 중단원 → 소단원)대로 소단원만 뽑아냄
 * @param nodes 교과서 목차
 */
export const flattenLeaves = (nodes: ChapterTree[]): ChapterTree[] =>
  sortByChapterOrder(nodes).flatMap((node) => (node.children.length === 0 ? [node] : flattenLeaves(node.children)));

/**
 * 소단원 묶음이 얼마나 골라졌는지 계산
 * @param leafIds 묶음 안의 소단원 id
 * @param selectedIds 고른 소단원 id
 */
export const getLeafSelection = (leafIds: number[], selectedIds: Set<number>): LeafSelection => {
  const selectedCount = leafIds.filter((id) => selectedIds.has(id)).length;
  if (selectedCount === 0) return "none";
  return selectedCount === leafIds.length ? "all" : "some";
};

/**
 * 소단원 묶음을 한 번에 고르거나 푼 새 Set. 모두 골라져 있으면 전부 풀고, 하나라도 빠져 있으면 전부 고름
 * @param selectedIds 지금 고른 소단원 id
 * @param leafIds 고르거나 풀 소단원 id
 */
export const toggleLeaves = (selectedIds: Set<number>, leafIds: number[]) => {
  const next = new Set(selectedIds);
  const allSelected = getLeafSelection(leafIds, selectedIds) === "all";
  leafIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
  return next;
};

/**
 * 고른 소단원을 계획 생성 입력으로 변환. 학교마다 진도 순서가 달라 소단원을 이어 붙이지 않고 하나씩 따로 보냄
 * @param textbookId 교과서 id
 * @param leaves 교과서의 소단원 목록
 * @param selectedIds 고른 소단원 id
 */
export const toSubjectEntries = (textbookId: number, leaves: ChapterTree[], selectedIds: Set<number>): PlanGenerationSubjectInput[] =>
  leaves
    .filter((leaf) => selectedIds.has(leaf.id))
    .map((leaf) => ({ textbookId, startChapterId: leaf.id, endChapterId: leaf.id }));
