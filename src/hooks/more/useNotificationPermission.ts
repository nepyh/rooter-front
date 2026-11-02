import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { syncPushToken } from "@/api/common/notification";

// ================================
// Hooks
// ================================

/**
 * useNotificationPermission — 기기(시스템) 알림 권한 상태와 바꾸러 가기
 * 시스템 설정에 다녀와 앱으로 돌아오면 상태를 다시 읽고, 새로 허용됐으면 이 기기 푸시 토큰을 등록합니다.
 * 아직 물어볼 수 있으면 시스템 허용 창을 띄우고, 이미 거부했거나 허용한 상태면 시스템 설정의 앱 화면을 엽니다.
 * iOS 는 한 번도 권한을 요청하지 않은 앱의 설정에 알림 항목을 보여주지 않기 때문입니다.
 * @returns granted(불러오기 전엔 null), openPermission
 */
export function useNotificationPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(false);
  const grantedRef = useRef<boolean | null>(null);

  const applyPermission = useCallback((permission: Notifications.NotificationPermissionsStatus) => {
    if (permission.granted && grantedRef.current === false) syncPushToken();
    grantedRef.current = permission.granted;
    setGranted(permission.granted);
    setCanAskAgain(permission.canAskAgain);
  }, []);

  const refresh = useCallback(() => Notifications.getPermissionsAsync().then(applyPermission), [applyPermission]);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(applyPermission);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, [applyPermission, refresh]);

  const openPermission = async () => {
    if (granted || !canAskAgain) {
      Linking.openSettings();
      return;
    }
    grantedRef.current = null;
    await syncPushToken();
    await refresh();
  };

  return { granted, openPermission };
}
