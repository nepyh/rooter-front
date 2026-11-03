import type { ChatTurn } from "@/api/home/Home/chat";
import { parseServerDateTime } from "@/utils/common/date";

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

// ================================
// Constants
// ================================

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS_PER_YEAR = 12;

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
 * 두 시각 사이에 꽉 찬 달 수 (1월 31일 → 2월 28일은 0달, 3월 1일은 1달)
 * @param from 이전 시각
 * @param to 이후 시각
 */
const getFullMonthsBetween = (from: Date, to: Date) => {
  const months = (to.getFullYear() - from.getFullYear()) * MONTHS_PER_YEAR + (to.getMonth() - from.getMonth());
  return to.getDate() < from.getDate() ? months - 1 : months;
};

/**
 * 채팅 목록에 보여줄 마지막 대화 날짜 문구. 기기 날짜 기준 하루 단위로 계산함
 * 오늘, 어제, n일 전 → 한 달이 넘으면 n달 전 → 일 년이 넘으면 n년 전
 * @param date 마지막으로 대화한 시각
 * @param now 지금 시각
 */
export const formatSessionDate = (date: Date, now: Date) => {
  const months = getFullMonthsBetween(date, now);
  if (months >= MONTHS_PER_YEAR) return `${Math.floor(months / MONTHS_PER_YEAR)}년 전`;
  if (months >= 1) return `${months}달 전`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfToday - startOfDate) / DAY_MS);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
};

/**
 * 서버 대화 한 줄을 화면 메시지로 변환
 * @param turn 서버가 준 대화 한 줄
 */
export const toChatMessage = (turn: ChatTurn): ChatMessage => ({
  id: `turn-${turn.id}`,
  role: turn.role.toLowerCase() === "user" ? "user" : "assistant",
  text: turn.content,
  createdAt: parseServerDateTime(turn.createdAt),
  feedback: turn.feedback,
});
