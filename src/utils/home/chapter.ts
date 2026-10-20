import type { ChapterTree } from "@/api/catalog";
import type { PlanGenerationSubjectInput } from "@/api/planGeneration";

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
 * 고른 소단원을 계획 생성 입력으로 변환. 학교마다 진도 순서가 달라 소단원을 이어 붙이지 않고 하나씩 따로 보냄
 * @param textbookId 교과서 id
 * @param leaves 교과서의 소단원 목록
 * @param selectedIds 고른 소단원 id
 */
export const toSubjectEntries = (textbookId: number, leaves: ChapterTree[], selectedIds: Set<number>): PlanGenerationSubjectInput[] =>
  leaves
    .filter((leaf) => selectedIds.has(leaf.id))
    .map((leaf) => ({ textbookId, startChapterId: leaf.id, endChapterId: leaf.id }));
