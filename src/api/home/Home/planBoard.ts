import { getBoardDaily, getPlanBoards, getPlanBoardSubjects } from '../../planBoard';
import { SUBJECT_CATEGORIES } from '@/constants/category';
import type { Category } from '@/constants/category';
import { toLocalDateString } from '@/utils/date';

// ================================
// Types
// ================================

/**
 * 그날 할일을 플랜보드와 연결하기 위한 정보
 * @param manualDailyPlanIds 직접 추가한 일정(시험일 없는 기본 보드)의 dailyPlanId
 * @param categoryByDailyPlanId dailyPlanId → 과목 색 (과목이 하나뿐인 보드만, 나머지는 neutral)
 */
export interface BoardInfo {
  manualDailyPlanIds: Set<number>;
  categoryByDailyPlanId: Map<number, Category>;
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
  const boards = await getPlanBoards();
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
  const boards = await getPlanBoards();
  const infos = await Promise.all(boards.map(async (board) => {
    const [daily, subjects] = await Promise.all([
      getBoardDaily(board.id, date),
      board.examDate === null ? Promise.resolve([]) : getPlanBoardSubjects(board.id).catch(() => []),
    ]);
    const subjectNames = new Set(subjects.map((subject) => subject.subjectName));
    const category: Category = subjectNames.size === 1 ? SUBJECT_CATEGORIES[[...subjectNames][0]] ?? "neutral" : "neutral";
    return { dailyPlanId: daily.dailyPlanId, manual: board.examDate === null, category };
  }));

  const linked = infos.filter((info): info is typeof info & { dailyPlanId: number } => typeof info.dailyPlanId === "number");
  return {
    manualDailyPlanIds: new Set(linked.filter((info) => info.manual).map((info) => info.dailyPlanId)),
    categoryByDailyPlanId: new Map(linked.map((info) => [info.dailyPlanId, info.category])),
  };
};
