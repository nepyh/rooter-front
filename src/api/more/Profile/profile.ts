import type { UserInfo } from '../../common/user';
import { getSchoolName } from './school';

/**
 * 내 정보로 학교 이름 찾기. 응답에 학교 이름이 없으면 학교 ID 로 NEIS 에서 찾음
 * @param info 내 정보
 * @returns 학교 이름, 학교 정보가 없거나 못 찾으면 null
 */
export const resolveSchoolName = async (info: UserInfo): Promise<string | null> => {
  if (info.schoolName) return info.schoolName;
  if (!info.schoolId) return null;
  return getSchoolName(info.schoolId).catch(() => null);
};
