import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "@/api/home/common/catalog";
import { getUserInfo } from "@/api/common/user";
import { getTextbooksWithSubject } from "@/api/home/TextbookSelectPage";
import { queryKeys } from "@/api/queryClient";
import { useUserStore } from "@/store";
import { filterTextbooksByGrade } from "@/utils/home/textbook";

// ================================
// Hooks
// ================================

/**
 * useTextbookCatalog — 교과서 선택 화면의 과목·교과서 목록 조회
 * 캐시에 담아 두어, 목차 선택 화면에서 돌아와 화면이 다시 그려져도 다시 불러오지 않고 바로 보여줍니다.
 * @param selectedSubjectId 고른 과목 id, null 이면 모든 과목
 * @returns subjects, textbooks(학년으로 거른 목록), loadingTextbooks
 */
export function useTextbookCatalog(selectedSubjectId: number | null) {
  const userId = useUserStore((state) => state.userId);

  const subjectsQuery = useQuery({
    queryKey: queryKeys.catalog.subjects,
    queryFn: getSubjects,
  });
  const subjects = subjectsQuery.data ?? [];
  const targets = selectedSubjectId === null ? subjects : subjects.filter((s) => s.id === selectedSubjectId);

  const textbooksQuery = useQuery({
    queryKey: queryKeys.catalog.textbooks(targets.map((s) => s.id)),
    queryFn: () => getTextbooksWithSubject(targets),
    enabled: targets.length > 0,
  });

  const userQuery = useQuery({
    queryKey: queryKeys.users.info(userId ?? 0),
    queryFn: () => getUserInfo(userId as number),
    enabled: userId !== null,
  });

  const loadingTextbooks = subjectsQuery.isPending || (targets.length > 0 && textbooksQuery.isPending);
  const textbooks = filterTextbooksByGrade(textbooksQuery.data ?? [], userQuery.data?.grade ?? null);

  return { subjects, textbooks, loadingTextbooks };
}
