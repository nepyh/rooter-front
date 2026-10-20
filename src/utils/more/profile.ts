import type { UserInfo } from "@/api/user";

/**
 * 학년·반 표시 문구. 학생 프로필 등록 전이라 값이 없으면 "-"
 * @param info 내 정보
 */
export const formatGradeClass = (info: UserInfo | null) => {
  if (!info?.grade || !info.classNumber) return "-";
  return `${info.grade}학년 ${info.classNumber}반`;
};
