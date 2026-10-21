import { getPlanBoards } from '../../common/planBoard';
import { toLocalDateString } from '@/utils/common/date';

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
