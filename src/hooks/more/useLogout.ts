import { router } from "expo-router";
import { logout } from "@/api/auth/common";

// ================================
// Hooks
// ================================

/**
 * useLogout — 로그아웃 후 온보딩 화면으로 이동하는 함수를 돌려줌
 * logout() 은 서버 호출이 실패해도 로컬 로그인 상태를 항상 정리하므로, 실패는 무시하고 화면만 옮깁니다.
 */
export function useLogout() {
  return async () => {
    await logout().catch(() => {});
    router.replace("/Auth/Onboarding");
  };
}
