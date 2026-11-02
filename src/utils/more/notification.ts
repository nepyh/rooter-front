import type { Href } from "expo-router";
import type { AppNotification } from "@/api/more/NotificationList";
import { isSameDay, toLocalDateString } from "@/utils/common/date";

// ================================
// Types
// ================================

export interface NotificationSection {
  key: string;
  title: string;
  data: AppNotification[];
}

// ================================
// Constants
// ================================

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// ================================
// Functions
// ================================

/**
 * 서버 시각 문자열을 Date 로 변환. 마이크로초(소수 6자리)는 밀리초까지만 남겨 파싱함
 * @param value 오프셋이 포함된 ISO 시각 (예: 2026-10-29T02:37:16.728625Z)
 */
export const parseServerDateTime = (value: string) => new Date(value.replace(/(\.\d{3})\d+/, "$1"));

/**
 * 날짜 묶음 제목. 오늘·어제가 아니면 M월 d일, 올해가 아니면 yyyy년 M월 d일
 * @param date 알림이 생긴 시각
 * @param now 지금 시각
 */
export const getDayLabel = (date: Date, now: Date) => {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameDay(date, now)) return "오늘";
  if (isSameDay(date, yesterday)) return "어제";
  const monthDay = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.getFullYear() === now.getFullYear() ? monthDay : `${date.getFullYear()}년 ${monthDay}`;
};

/**
 * 알림 카드의 지난 시간 문구 (방금, n분 전, n시간 전, n일 전)
 * @param date 알림이 생긴 시각
 * @param now 지금 시각
 */
export const formatRelativeTime = (date: Date, now: Date) => {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE_MS) return "방금";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  return `${Math.floor(diff / DAY_MS)}일 전`;
};

/**
 * 최신순 알림 목록을 기기 날짜별로 묶음
 * @param notifications 최신순 알림 목록
 * @param now 지금 시각
 */
export const groupNotificationsByDay = (notifications: AppNotification[], now: Date): NotificationSection[] => {
  const sections: NotificationSection[] = [];
  notifications.forEach((notification) => {
    const createdAt = parseServerDateTime(notification.createdAt);
    const key = toLocalDateString(createdAt);
    const last = sections[sections.length - 1];
    if (last?.key === key) last.data.push(notification);
    else sections.push({ key, title: getDayLabel(createdAt, now), data: [notification] });
  });
  return sections;
};

/**
 * 알림을 눌렀을 때 이동할 화면. 모르는 종류면 null (알림함에만 보여줌)
 * 할 일 알림은 시작 몇 분 전에 오므로 알림이 생긴 날짜의 할 일 화면을 엶
 * @param notification 누른 알림
 */
export const getNotificationHref = (notification: AppNotification): Href | null => {
  if (notification.type === "TASK_REMINDER") {
    const date = toLocalDateString(parseServerDateTime(notification.createdAt));
    return { pathname: "/Todo/Todo", params: { date } };
  }
  return null;
};
