import { fetchCachedBoardDaily, fetchCachedPlanBoards, fetchCachedPlanBoardSubjects } from '../../common/planBoard';
import { SUBJECT_CATEGORIES } from '@/constants/category';
import type { Category } from '@/constants/category';
import { toLocalDateString } from '@/utils/common/date';

// ================================
// Types
// ================================

/**
 * 그날 할일을 플랜보드와 연결하기 위한 정보. 캐시를 기기에 JSON 으로 저장하므로 Set·Map 대신 배열·객체로 둠
 * @param manualDailyPlanIds 직접 추가한 일정(시험일 없는 기본 보드)의 dailyPlanId
 * @param categoryByDailyPlanId dailyPlanId → 과목 색 (과목이 하나뿐인 보드만, 나머지는 neutral)
 */
export interface BoardInfo {
  manualDailyPlanIds: number[];
  categoryByDailyPlanId: Record<number, Category>;
}

// ================================
// Functions
// ================================

/**
 * 플랜보드 중 오늘 이후 가장 가까운 시험일 조회
 * @returns 시험일 (YYYY-MM-DD), 없으면 null
 */
export const getNextExamDate = async (): Promise<string | null> => {
  const today = toLocalDateString(new Date());
  const boards = await fetchCachedPlanBoards();
  const upcoming = boards
    .map((board) => board.examDate)
    .filter((date): date is string => !!date && date >= today)
    .sort();
  return upcoming[0] ?? null;
};

/**
 * 할일 응답에 보드·과목 정보가 없어서, 보드별 그날 dailyPlanId 로 연결 정보를 만듦
 * @param date 조회할 날짜 (YYYY-MM-DD)
 */
export const getBoardInfo = async (date: string): Promise<BoardInfo> => {
  const boards = await fetchCachedPlanBoards();
  const infos = await Promise.all(boards.map(async (board) => {
    const [daily, subjects] = await Promise.all([
      fetchCachedBoardDaily(board.id, date),
      board.examDate === null ? Promise.resolve([]) : fetchCachedPlanBoardSubjects(board.id).catch(() => []),
    ]);
    const subjectNames = new Set(subjects.map((subject) => subject.subjectName));
    const category: Category = subjectNames.size === 1 ? SUBJECT_CATEGORIES[[...subjectNames][0]] ?? "neutral" : "neutral";
    return { dailyPlanId: daily.dailyPlanId, manual: board.examDate === null, category };
  }));

  const linked = infos.filter((info): info is typeof info & { dailyPlanId: number } => typeof info.dailyPlanId === "number");
  return {
    manualDailyPlanIds: linked.filter((info) => info.manual).map((info) => info.dailyPlanId),
    categoryByDailyPlanId: Object.fromEntries(linked.map((info) => [info.dailyPlanId, info.category])),
  };
};
