import { createPlanTask, getOrCreateCurrentPlanBoard } from '../../planBoard';
import { DAY_MIN, parseHHmm } from '@/utils/common/time';

// ================================
// Functions
// ================================

/**
 * 직접 만든 할 일 추가. 지금 쓰는 기본 플랜보드(없으면 새로 만듦)에 넣고,
 * 종료가 시작보다 이르면 자정을 넘긴 것으로 보고 소요 시간을 계산함
 * @param date 할 일 날짜 (yyyy-MM-dd)
 * @param taskName 할 일 이름
 * @param startTime 시작 시간 (HH:MM)
 * @param endTime 종료 시간 (HH:MM)
 */
export const createTodo = async (date: string, taskName: string, startTime: string, endTime: string) => {
  const estimatedMinutes = ((parseHHmm(endTime) - parseHHmm(startTime) + DAY_MIN) % DAY_MIN) || DAY_MIN;
  const board = await getOrCreateCurrentPlanBoard();
  await createPlanTask({ planBoardId: board.id, planDate: date, taskName, startTime, endTime, estimatedMinutes });
};
