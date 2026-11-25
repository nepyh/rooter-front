import { useEffect } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { markNotificationRead } from "@/api/more/NotificationList";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useOpenTaskQuiz } from "@/hooks/common/useOpenTaskQuiz";
import { getNotificationHref, getNotificationQuiz } from "@/utils/more/notification";

// ================================
// Hooks
// ================================

/**
 * useNotificationTapRouting — 푸시 알림을 누르면 알림 종류에 맞는 화면으로 이동
 * 앱이 꺼져 있다가 알림으로 켜진 경우도 받습니다. 로그인 후 온보딩·로그인 화면(/Auth)을 지나 첫 화면에 들어온 뒤에 이동해야
 * 온보딩의 첫 화면 이동에 덮이지 않아서, 그전에는 기다렸다가 처리합니다.
 * 서버가 푸시 data 에 넣어 준 notificationId 로 알림함의 그 알림도 읽음 처리합니다.
 * 퀴즈 준비 알림은 그 할일의 퀴즈를 엽니다 (재도전 대기 중이면 대기 화면).
 * @param isLogin 로그인했는지
 * @param pathname 지금 화면 경로
 */
export function useNotificationTapRouting(isLogin: boolean, pathname: string) {
  const response = Notifications.useLastNotificationResponse();
  const ready = isLogin && pathname !== "/" && !pathname.startsWith("/Auth");
  const openTaskQuiz = useOpenTaskQuiz();

  useEffect(() => {
    if (
      !ready ||
      !response ||
      response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    )
      return;
    Notifications.clearLastNotificationResponse();

    const data = response.notification.request.content.data ?? {};
    const notificationId = Number(data.notificationId);
    if (notificationId) {
      markNotificationRead(notificationId)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.all,
          }),
        )
        .catch(() => {});
    }

    const target = {
      type: typeof data.type === "string" ? data.type : "",
      data,
      date: new Date(response.notification.date),
    };
    const quiz = getNotificationQuiz(target);
    if (quiz) {
      openTaskQuiz(quiz).catch(() => {});
      return;
    }
    const href = getNotificationHref(target);
    if (href) router.push(href);
  }, [ready, response, openTaskQuiz]);
}
