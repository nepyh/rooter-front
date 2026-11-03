import { isSameDay } from "@/utils/common/date";

// ================================
// Types
// ================================

export type ChatFeedback = "LIKE" | "DISLIKE";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
  feedback: ChatFeedback | null;
}

export interface ChatSession {
  id: string;
  title: string | null;
  updatedAt: Date;
  messages: ChatMessage[];
}

// ================================
// Constants
// ================================

const DAY_MS = 24 * 60 * 60 * 1000;
const RELATIVE_DAY_LIMIT = 7;

// ================================
// Functions
// ================================

/**
 * 채팅 메시지 아래에 보여줄 시각 문구 (예: 오전 8시 13분)
 * @param date 메시지를 보낸 시각
 */
export const formatChatTime = (date: Date) => {
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}시 ${date.getMinutes()}분`;
};

/**
 * 채팅 목록에 보여줄 마지막 대화 날짜 문구 (오늘, 어제, n일 전, 일주일이 넘으면 M월 d일)
 * @param date 마지막으로 대화한 시각
 * @param now 지금 시각
 */
export const formatSessionDate = (date: Date, now: Date) => {
  if (isSameDay(date, now)) return "오늘";
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfToday - startOfDate) / DAY_MS);
  if (days === 1) return "어제";
  if (days < RELATIVE_DAY_LIMIT) return `${days}일 전`;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};
