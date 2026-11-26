import type { Textbook } from "@/api/home/common/catalog";
import { TEXTBOOK_CARD_BASE_WIDTH, TEXTBOOK_GRID_MIN_COLUMNS } from "@/constants/textbook";

/**
 * 영역 너비에 맞는 교과서 격자 한 줄의 카드 수와 카드 너비. 최소 카드 수를 지키고, 기준 너비 카드가 더 들어가면 카드 수를 늘린 뒤 남는 공간 없이 카드를 늘림
 * 카드 너비는 소수점을 버려서, 반올림 오차로 마지막 카드가 다음 줄로 밀리지 않게 함
 * @param areaWidth 카드를 깔 영역 너비
 * @param gap 카드 사이 간격
 */
export const getTextbookGridLayout = (areaWidth: number, gap: number) => {
  const columns = Math.max(TEXTBOOK_GRID_MIN_COLUMNS, Math.floor((areaWidth + gap) / (TEXTBOOK_CARD_BASE_WIDTH + gap)));
  return { columns, cardWidth: Math.floor((areaWidth - gap * (columns - 1)) / columns) };
};

/**
 * 제목이 "N학년 ..." 으로 시작하는 교과서를 학년 기준으로 거름. 학년 표기 없는 교과서는 유지
 * @param textbooks 거를 교과서 목록
 * @param grade 학년, null 이면 거르지 않음
 */
export const filterTextbooksByGrade = <T extends Textbook>(textbooks: T[], grade: number | null) => {
  if (grade === null) return textbooks;
  return textbooks.filter((textbook) => {
    const titleGrade = textbook.title.match(/^(\d)학년/)?.[1];
    return titleGrade === undefined || Number(titleGrade) === grade;
  });
};

/**
 * 교과서 카드에 보여줄 제목과 출판사. 출판사가 없으면 제목 괄호 안 출판사, 그것도 없으면 과목 이름
 * @param textbook 교과서
 * @param fallback 출판사를 못 찾았을 때 쓸 이름
 */
export const getTextbookLabels = (textbook: Textbook, fallback: string) => ({
  title: textbook.title.replace(/\s*\([^)]+\)\s*$/, ""),
  publisher: textbook.publisherName ?? textbook.title.match(/\(([^)]+)\)\s*$/)?.[1] ?? fallback,
});

/**
 * 교과서 표지 이미지 소스. 서버가 주는 표지 주소는 요청마다 서명이 바뀌어서, 서명을 뺀 경로로 캐시함
 * @param uri 서버가 준 표지 주소
 * @returns expo-image 의 source
 */
export const toCoverSource = (uri: string) => ({ uri, cacheKey: uri.split("?")[0] });
