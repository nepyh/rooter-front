import api from './axios';
import type { PlanTask } from './planBoard';

// ================================
// Types
// ================================

export interface CalendarDay {
  date: string; // yyyy-MM-dd
  plannedMinutes: number;
}

export interface CalendarExam {
  planBoardId: number;
  title: string;
  examDate: string; // yyyy-MM-dd
  dDay: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  eventDate: string; // yyyy-MM-dd
  memo?: string | null;
}

export interface CalendarRange {
  days: CalendarDay[];
  exams: CalendarExam[];
  events: CalendarEvent[];
}

export interface DailyCompletion {
  date: string; // yyyy-MM-dd
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0~100
  tasks: PlanTask[];
  events: CalendarEvent[];
}

export interface CreateCalendarEventInput {
  title: string;
  eventDate: string; // yyyy-MM-dd
  memo?: string;
}

/**
 * 기간별 캘린더 조회 API 함수
 * @param start 조회 시작일 (yyyy-MM-dd)
 * @param end 조회 종료일 (yyyy-MM-dd)
 * @returns 날짜별 공부 시간, 시험 일정, 개인 일정
 */
export const getCalendarRange = async (start: string, end: string): Promise<CalendarRange> => {
  const response = await api.get('/calendar', { params: { start, end } });
  return response.data;
};

/**
 * 특정 날짜 학습 이행 요약 조회 API 함수
 * @param date 조회할 날짜 (yyyy-MM-dd)
 * @returns 그날의 할일 목록/완료율/개인 일정
 */
export const getDaySummary = async (date: string): Promise<DailyCompletion> => {
  const response = await api.get(`/calendar/${date}`);
  return response.data;
};

/**
 * 개인 일정 추가 API 함수
 * @param input 추가할 일정 정보
 * @returns 생성된 일정
 */
export const createCalendarEvent = async (input: CreateCalendarEventInput): Promise<CalendarEvent> => {
  const response = await api.post('/calendar/events', input);
  return response.data;
};

/**
 * 개인 일정 삭제 API 함수
 * @param eventId 삭제할 일정 ID
 */
export const deleteCalendarEvent = async (eventId: number): Promise<void> => {
  await api.delete(`/calendar/events/${eventId}`);
};
