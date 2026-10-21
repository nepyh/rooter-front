import { AppState } from 'react-native';
import { QueryClient, focusManager } from '@tanstack/react-query';

// ================================
// Constants
// ================================

const STALE_TIME_MS = 60_000;

// ================================
// Query Client
// ================================

/**
 * 서버에서 받아온 데이터를 담는 앱 전체 캐시. 로그아웃하면 useUserStore.logout() 에서 비웁니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: 1,
    },
  },
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
  return () => subscription.remove();
});

// ================================
// Query Keys
// ================================

/**
 * 캐시 키 모음. 앞부분이 같은 키는 invalidateQueries 로 한 번에 무효화됩니다.
 */
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    daily: (date: string) => ['tasks', 'daily', date] as const,
    weekly: (date: string) => ['tasks', 'weekly', date] as const,
    quizItems: (date: string) => ['tasks', 'quiz-items', date] as const,
  },
  boards: {
    all: ['boards'] as const,
    info: (date: string) => ['boards', 'info', date] as const,
    nextExamDate: ['boards', 'next-exam-date'] as const,
  },
  busyTimes: {
    all: ['busy-times'] as const,
    range: (startDate: string, endDate: string) => ['busy-times', startDate, endDate] as const,
  },
};

/**
 * 할 일을 추가·수정·삭제·완료하거나 계획을 만든 뒤 호출. 태스크·보드·바쁜 시간 캐시를 모두 무효화해서
 * 지금 보고 있는 화면은 바로, 나머지 화면은 다시 들어갈 때 새로 불러옵니다.
 */
export const invalidatePlanQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.boards.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.busyTimes.all }),
  ]);
