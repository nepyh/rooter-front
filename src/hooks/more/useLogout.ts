import { useCallback } from "react";
import { router } from "expo-router";
import { logout } from "@/api/more/common";

// ================================
// Hooks
// ================================

/**
 * useLogout — 로그아웃 후 온보딩 화면으로 이동하는 함수를 돌려줌
 * logout() 은 서버 호출이 실패해도 로컬 로그인 상태를 항상 정리하므로, 실패는 무시하고 화면만 옮깁니다.
 * 같은 함수를 계속 돌려줘서 effect 의존성에 넣어도 매 렌더마다 다시 실행되지 않음
 */
export function useLogout() {
  return useCallback(async () => {
    await logout().catch(() => {});
    router.replace("/Auth/Onboarding");
  }, []);
}
