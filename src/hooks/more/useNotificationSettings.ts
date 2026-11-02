import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNotificationSettings, updateNotificationSettings, type NotificationSettings } from "@/api/more/NotificationSetting";
import { queryClient, queryKeys } from "@/api/queryClient";

// ================================
// Hooks
// ================================

/**
 * useNotificationSettings — 할일 알림 켜기/끄기와 몇 분 전에 받을지 조회·수정
 * 바꾼 값을 화면에 먼저 반영하고 서버에 보내며, 실패하면 이전 값으로 되돌립니다.
 * @returns settings(불러오기 전엔 null), update, errorMessage, clearError
 */
export function useNotificationSettings() {
  const [errorMessage, setErrorMessage] = useState("");
  const settingsQuery = useQuery({
    queryKey: queryKeys.notifications.settings,
    queryFn: getNotificationSettings,
  });

  const update = async (patch: Partial<NotificationSettings>) => {
    const previous = queryClient.getQueryData<NotificationSettings>(queryKeys.notifications.settings);
    if (!previous) return;

    queryClient.setQueryData<NotificationSettings>(queryKeys.notifications.settings, { ...previous, ...patch });
    try {
      const saved = await updateNotificationSettings(patch);
      queryClient.setQueryData(queryKeys.notifications.settings, saved);
    } catch {
      queryClient.setQueryData(queryKeys.notifications.settings, previous);
      setErrorMessage("알림 설정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return {
    settings: settingsQuery.data ?? null,
    update,
    errorMessage,
    clearError: () => setErrorMessage(""),
  };
}
