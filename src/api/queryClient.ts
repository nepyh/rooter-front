import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, focusManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// ================================
// Constants
// ================================

const STALE_TIME_MS = 60_000;
export const CACHE_MAX_AGE_MS = 24 * 60 * 60_000;

// ================================
// Query Client
// ================================

/**
 * 서버에서 받아온 데이터를 담는 앱 전체 캐시. 로그아웃하면 clearQueryCache() 로 비웁니다.
 * gcTime 을 기기 저장 기간(CACHE_MAX_AGE_MS)과 맞춰, 화면을 떠나 있어도 하루 동안은 캐시를 지우지 않습니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: CACHE_MAX_AGE_MS,
      retry: 1,
    },
  },
});

/**
 * 캐시를 기기(AsyncStorage)에 저장해, 앱을 다시 켰을 때 첫 화면을 저장된 캐시로 바로 그립니다.
 */
export const queryPersister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'rooter-query-cache' });

/**
 * 메모리 캐시와 기기에 저장된 캐시를 모두 비움. 로그아웃·토큰 만료 시 호출
 */
export const clearQueryCache = () => {
  queryClient.clear();
  return Promise.resolve(queryPersister.removeClient()).catch(() => {});
};

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
    weekly: (weekStart: string) => ['tasks', 'weekly', weekStart] as const,
    quizItems: (date: string) => ['tasks', 'quiz-items', date] as const,
  },
  boards: {
    all: ['boards'] as const,
    list: ['boards', 'list'] as const,
    nextExamDate: ['boards', 'next-exam-date'] as const,
  },
  busyTimes: {
    all: ['busy-times'] as const,
    range: (startDate: string, endDate: string) => ['busy-times', startDate, endDate] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    range: (start: string, end: string) => ['calendar', start, end] as const,
  },
  contribution: {
    all: ['contribution'] as const,
    range: (userId: number, start: string, end: string) => ['contribution', userId, start, end] as const,
  },
  catalog: {
    subjects: ['catalog', 'subjects'] as const,
    textbooks: (subjectIds: number[]) => ['catalog', 'textbooks', subjectIds] as const,
  },
  users: {
    info: (userId: number) => ['users', userId] as const,
  },
  agreements: {
    catalog: ['agreements', 'catalog'] as const,
    user: (userId: number) => ['agreements', 'user', userId] as const,
  },
};

/**
 * 이미 있는 할 일을 수정·삭제·완료한 뒤 호출. 할 일·바쁜 시간·잔디(완료율) 캐시만 무효화하고,
 * 바뀌지 않는 보드·캘린더 캐시는 그대로 둡니다.
 */
export const invalidateTaskQueries = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.busyTimes.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.contribution.all }),
  ]);

/**
 * 할 일을 새로 추가하거나 계획·보드를 만든 뒤 호출. 보드와 그날 일일 계획이 새로 생길 수 있어서
 * 태스크·보드·바쁜 시간·캘린더(시험일)·잔디(완료율) 캐시를 모두 무효화합니다.
 * 지금 보고 있는 화면은 바로, 나머지 화면은 다시 들어갈 때 새로 불러옵니다.
 */
export const invalidatePlanQueries = () =>
  Promise.all([
    invalidateTaskQueries(),
    queryClient.invalidateQueries({ queryKey: queryKeys.boards.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all }),
  ]);
