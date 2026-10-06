import api from './axios';

// ================================
// Types
// ================================

// SLEEP 수면 · SCHOOL 등교일 00:00~하교 · UNAVAILABLE 요일별 불가능 시간 · TASK 모든 플랜보드 할일
export type BusyTimeType = 'SLEEP' | 'SCHOOL' | 'UNAVAILABLE' | 'TASK';

export interface BusyTimeItem {
  type: BusyTimeType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm, 하루 끝은 24:00
  taskId: number | null;
  taskName: string | null;
  planBoardId: number | null;
  planBoardTitle: string | null;
}

export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface DailyBusyTime {
  date: string; // yyyy-MM-dd
  isSchoolDay: boolean; // 공휴일·방학이면 false
  busyTimes: BusyTimeItem[];
  freeTimes: TimeRange[];
}

export interface BusyTime {
  startDate: string;
  endDate: string;
  days: DailyBusyTime[];
}

/**
 * 날짜별 바쁜 시간·빈 시간 조회 API 함수 (AI 계획 생성과 같은 기준)
 * @param startDate 시작 날짜 (yyyy-MM-dd)
 * @param endDate 끝 날짜 (yyyy-MM-dd)
 * @returns 날짜별 막힌 시간과 빈 시간
 */
export const getBusyTimes = async (startDate: string, endDate: string): Promise<BusyTime> => {
  const response = await api.get('/busy-times', { params: { startDate, endDate } });
  return response.data;
};
