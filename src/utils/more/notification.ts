import type { Href } from "expo-router";
import type { AppNotification } from "@/api/more/NotificationList";
import { isSameDay, parseServerDateTime, toLocalDateString } from "@/utils/common/date";

// ================================
// Types
// ================================

/**
 * 이동할 화면을 고르는 데 필요한 알림 정보. 알림함 목록과 눌린 푸시 알림 양쪽에서 만듦
 */
export interface NotificationTarget {
  type: string;
  data: Record<string, unknown>;
  date: Date;
}

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
 * 알림함의 알림을 화면 이동용 정보로 바꿈
 * @param notification 알림함 알림
 */
export const toNotificationTarget = (notification: AppNotification): NotificationTarget => ({
  type: notification.type,
  data: notification.data,
  date: parseServerDateTime(notification.createdAt),
});

/**
 * 알림을 눌렀을 때 이동할 화면. 모르는 종류면 null (알림함에만 보여줌)
 * - 할 일 알림: 시작 몇 분 전에 오므로 알림이 생긴 날짜의 할 일 화면
 * - 오늘 공부 설문 알림: 그날 일일 계획의 학습 피드백 화면
 * - AI 계획 완성·실패 알림 (rooter-back#405): 홈. 실패했으면 홈에서 남은 계획 다시 만들기를 안내함
 * @param target 누른 알림
 */
export const getNotificationHref = ({ type, data, date }: NotificationTarget): Href | null => {
  if (type === "TASK_REMINDER") {
    return { pathname: "/Todo/Todo", params: { date: toLocalDateString(date) } };
  }
  if (type === "DAILY_FEEDBACK_REMINDER" && data.dailyPlanId) {
    return { pathname: "/Quiz/FeedbackPage", params: { dailyPlanId: String(data.dailyPlanId) } };
  }
  if (type === "PLAN_GENERATION_COMPLETED" || type === "PLAN_GENERATION_FAILED") {
    return "/Home/Home";
  }
  return null;
};
