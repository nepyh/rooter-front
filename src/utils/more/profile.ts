import type { UserInfo } from "@/api/common/user";

/**
 * 학년·반 표시 문구. 학생 프로필 등록 전이라 값이 없으면 "-"
 * @param info 내 정보
 */
export const formatGradeClass = (info: UserInfo | null) => {
  if (!info?.grade || !info.classNumber) return "-";
  return `${info.grade}학년 ${info.classNumber}반`;
};

/**
 * 프로필 사진 이미지 소스. presigned URL 은 요청마다 서명(쿼리)이 바뀌므로, 쿼리를 뗀 경로를 캐시 키로 씀
 * @param uri 프로필 사진 주소
 */
export const toAvatarSource = (uri: string) => ({ uri, cacheKey: uri.split("?")[0] });
