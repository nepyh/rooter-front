import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store";
import { getAgreementCatalog, getPendingAgreements, getUserAgreements } from "@/api/common/agreement";
import { queryKeys } from "@/api/queryClient";

// ================================
// Hooks
// ================================

/**
 * useAgreementCatalog — 현재 게시 중인 약관 목록 조회 (인증 불필요)
 * @param enabled false 면 불러오지 않음
 * @returns 약관 목록 (불러오기 전이면 undefined)
 */
export function useAgreementCatalog(enabled = true) {
  const catalogQuery = useQuery({
    queryKey: queryKeys.agreements.catalog,
    queryFn: getAgreementCatalog,
    enabled,
  });

  return catalogQuery.data;
}

/**
 * useAgreements — 현재 약관 목록과 내 동의 내역을 불러와 남은 필수 미동의 항목을 계산
 * 로그인되어 있을 때만 불러옵니다.
 * @returns catalog, userAgreements, pendingAgreements(둘 다 불러오기 전이면 빈 배열)
 */
export function useAgreements() {
  const userId = useUserStore((state) => state.userId);
  const isLogin = useUserStore((state) => state.isLogin);

  const catalog = useAgreementCatalog(isLogin);

  const userQuery = useQuery({
    queryKey: queryKeys.agreements.user(userId ?? 0),
    queryFn: () => getUserAgreements(userId as number),
    enabled: isLogin && userId !== null,
  });

  const userAgreements = userQuery.data;
  const pendingAgreements = catalog && userAgreements ? getPendingAgreements(catalog, userAgreements) : [];

  return { catalog, userAgreements, pendingAgreements };
}
