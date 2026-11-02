import api from '../../axios';

// ================================
// Types
// ================================

export type NotificationType = 'TASK_REMINDER';

export interface AppNotification {
  id: number;
  type: NotificationType | (string & {});
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  notifications: AppNotification[];
  nextCursor: number | null;
}

// ================================
// Constants
// ================================

export const NOTIFICATION_PAGE_SIZE = 20;

// ================================
// Functions
// ================================

/**
 * 알림함 목록 조회 API 함수. 읽은 알림도 함께 최신순으로 옴
 * @param cursor 앞 페이지 응답의 nextCursor, 생략하면 첫 페이지
 * @param limit 한 페이지 개수 (1~50)
 * @returns 알림 목록과 다음 페이지 cursor (null 이면 마지막)
 */
export const getNotifications = async (cursor?: number, limit = NOTIFICATION_PAGE_SIZE): Promise<NotificationPage> => {
  const response = await api.get('/notifications', { params: { cursor, limit } });
  return response.data;
};

/**
 * 안 읽은 알림 개수 조회 API 함수
 * @returns 안 읽은 알림 개수
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.unreadCount;
};

/**
 * 알림 하나 읽음 처리 API 함수. 이미 읽은 알림이어도 성공함
 * @param id 알림 ID
 * @returns 읽음 처리된 알림
 */
export const markNotificationRead = async (id: number): Promise<AppNotification> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * 알림 전부 읽음 처리 API 함수
 * @returns 이번 요청으로 읽음 처리된 개수
 */
export const markAllNotificationsRead = async (): Promise<number> => {
  const response = await api.patch('/notifications/read-all');
  return response.data.updatedCount;
};
