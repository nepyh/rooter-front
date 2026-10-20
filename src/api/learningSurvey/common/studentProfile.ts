import { createStudentProfile } from '../../common/user';

/**
 * 회원가입 때 고른 학교·학년·반으로 학생 프로필 저장. 실패해도 다음 화면으로 넘어갈 수 있도록 에러를 던지지 않음
 * @param userId 유저 ID
 * @param schoolId 학교 ID
 * @param grade 학년 (문자열)
 * @param classNum 반 (문자열)
 */
export const saveStudentProfile = (userId: number, schoolId: string, grade: string, classNum: string) =>
  createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) }).catch(() => {});
