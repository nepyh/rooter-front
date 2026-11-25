import type { Textbook } from "@/api/home/common/catalog";

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
