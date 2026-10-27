import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store";
import { getUserInfo } from "@/api/common/user";
import { queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";

// ================================
// Hooks
// ================================

/**
 * useUserInfo — 내 정보(소개·프로필 사진 주소 등) 조회
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * @returns 내 정보 (불러오기 전이거나 로그인 전이면 null)
 */
export function useUserInfo() {
  const userId = useUserStore((state) => state.userId);
  const queryKey = queryKeys.users.info(userId ?? 0);

  const userQuery = useQuery({
    queryKey,
    queryFn: () => getUserInfo(userId as number),
    enabled: userId !== null,
  });

  useRefetchOnFocus([queryKey]);

  return userQuery.data ?? null;
}
