import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, type InfiniteData } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATION_PAGE_SIZE,
  type AppNotification,
  type NotificationPage,
} from "@/api/more/NotificationList";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";

// ================================
// Functions
// ================================

const setCachedRead = (match: (notification: AppNotification) => boolean) =>
  queryClient.setQueryData<InfiniteData<NotificationPage, number | undefined>>(queryKeys.notifications.list, (data) =>
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        notifications: page.notifications.map((notification) => (match(notification) ? { ...notification, read: true } : notification)),
      })),
    },
  );

const resyncNotifications = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

// ================================
// Hooks
// ================================

/**
 * useNotifications — 안 읽은 알림 목록(무한 스크롤)과 개수 조회, 읽음 처리
 * 목록 API 는 읽은 알림도 함께 주므로 안 읽은 것만 걸러 보여주고, 안 읽은 개수만큼 모일 때까지만 다음 페이지를 불러옵니다.
 * 읽음 처리는 화면에서 먼저 빼고 서버에 보내며, 실패하면 서버 값으로 다시 맞춥니다.
 * @returns loaded, failed, notifications(안 읽은 알림), unreadCount, loadingMore, loadMore, markRead, readAll, errorMessage, clearError
 */
export function useNotifications() {
  const [errorMessage, setErrorMessage] = useState("");

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const countQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getUnreadNotificationCount,
  });

  useRefetchOnFocus([queryKeys.notifications.list, queryKeys.notifications.unreadCount]);

  const notifications = listQuery.data?.pages.flatMap((page) => page.notifications).filter((notification) => !notification.read) ?? [];
  const unreadCount = countQuery.data ?? 0;
  const canLoadMore = listQuery.hasNextPage && !listQuery.isFetchingNextPage && notifications.length < unreadCount;
  const { fetchNextPage } = listQuery;

  useEffect(() => {
    if (canLoadMore && notifications.length < NOTIFICATION_PAGE_SIZE) fetchNextPage();
  }, [canLoadMore, notifications.length, fetchNextPage]);

  const loadMore = () => {
    if (canLoadMore) fetchNextPage();
  };

  const markRead = (id: number) => {
    setCachedRead((notification) => notification.id === id);
    queryClient.setQueryData<number>(queryKeys.notifications.unreadCount, (count) => (count === undefined ? count : Math.max(0, count - 1)));
    markNotificationRead(id).catch(resyncNotifications);
  };

  const readAll = async () => {
    if (unreadCount === 0) return;
    setCachedRead(() => true);
    queryClient.setQueryData<number>(queryKeys.notifications.unreadCount, 0);
    try {
      await markAllNotificationsRead();
    } catch {
      setErrorMessage("모두 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
      resyncNotifications();
    }
  };

  return {
    loaded: !listQuery.isPending,
    failed: listQuery.isError && !listQuery.data,
    notifications,
    unreadCount,
    loadingMore: listQuery.isFetchingNextPage,
    loadMore,
    markRead,
    readAll,
    errorMessage,
    clearError: () => setErrorMessage(""),
  };
}
