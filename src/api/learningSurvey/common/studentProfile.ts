import { createStudentProfile } from '../../common/user';

/**
 * 회원가입 때 고른 학교·학년·반으로 학생 프로필 저장. 실패하면 에러를 던짐 (화면에서 다시 시도를 물어봄)
 * @param userId 유저 ID
 * @param schoolId 학교 ID
 * @param grade 학년 (문자열)
 * @param classNum 반 (문자열)
 */
export const saveStudentProfile = (userId: number, schoolId: string, grade: string, classNum: string) =>
  createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) });
