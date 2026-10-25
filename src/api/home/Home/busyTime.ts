import api from '../../axios';

// ================================
// Types
// ================================

export type BusyTimeType = 'SLEEP' | 'SCHOOL_PREP' | 'SCHOOL' | 'COMMUTE' | 'MEAL' | 'UNAVAILABLE' | 'TASK';

/**
 * 바쁜 시간 하나
 * @param type 바쁜 시간 종류
 * @param label 화면에 그대로 보여줄 이름
 */
export interface BusyTimeItem {
  type: BusyTimeType;
  label: string;
  startTime: string;
  endTime: string;
  taskId: number | null;
  taskName: string | null;
  planBoardId: number | null;
  planBoardTitle: string | null;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface DailyBusyTime {
  date: string;
  isSchoolDay: boolean;
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
