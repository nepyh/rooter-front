import { useEffect, useState } from "react";
import { createStudentProfile } from "@/api/common/user";
import { resolveSchoolName } from "@/api/more/Profile";
import { queryClient, queryKeys } from "@/api/queryClient";
import type { School } from "@/api/auth/SchoolSelect";
import { useUserInfo } from "@/hooks/common/useUserInfo";
import { useUserStore } from "@/store";

// ================================
// Hooks
// ================================

/**
 * useSchoolEdit — 학교 정보 수정 화면의 학교·학년·반 입력과 저장
 * 고치기 전까지는 지금 저장된 학교·학년·반을 보여주고, 저장하면 학생 프로필을 덮어쓴 뒤 내 정보 캐시를 다시 불러옵니다.
 * 새 학년이 되면 여기서 학년만 바꾸면 됩니다.
 * @returns query, selected, grade, classNum, canSave, saving, 입력 핸들러, save(성공 여부를 돌려줌)
 */
export function useSchoolEdit() {
  const userId = useUserStore((state) => state.userId);
  const userInfo = useUserInfo();

  const [savedSchoolName, setSavedSchoolName] = useState<string | null>(null);
  // 사용자가 고친 값, 안 고쳤으면 null 이라 저장된 값을 보여줌
  const [editedQuery, setEditedQuery] = useState<string | null>(null);
  const [editedSchoolId, setEditedSchoolId] = useState<string | null>(null);
  const [editedSelected, setEditedSelected] = useState<boolean | null>(null);
  const [editedGrade, setGrade] = useState<string | null>(null);
  const [editedClassNum, setClassNum] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userInfo) return;
    resolveSchoolName(userInfo).then(setSavedSchoolName);
  }, [userInfo]);

  const query = editedQuery ?? savedSchoolName ?? "";
  const schoolId = editedSchoolId ?? userInfo?.schoolId ?? null;
  const selected = editedSelected ?? !!userInfo?.schoolId;
  const grade = editedGrade ?? (userInfo?.grade ? String(userInfo.grade) : "");
  const classNum =
    editedClassNum ??
    (userInfo?.classNumber ? String(userInfo.classNumber) : "");

  const canSave = selected && !!schoolId && !!grade && !!classNum && !saving;

  const changeQuery = (text: string) => {
    setEditedQuery(text);
    setEditedSelected(false);
  };

  const selectSchool = (school: School) => {
    setEditedQuery(school.name);
    setEditedSchoolId(school.schoolId);
    setEditedSelected(true);
  };

  const editSchool = () => {
    setEditedQuery(query);
    setEditedSelected(false);
  };

  const save = async () => {
    if (!canSave || userId === null || !schoolId) return false;
    setSaving(true);
    try {
      await createStudentProfile(userId, {
        schoolId,
        grade: Number(grade),
        classNumber: Number(classNum),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.info(userId),
      });
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    query,
    selected,
    grade,
    classNum,
    canSave,
    saving,
    changeQuery,
    selectSchool,
    editSchool,
    setGrade,
    setClassNum,
    save,
  };
}
