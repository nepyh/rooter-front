import { fetchCachedBoardDaily, fetchCachedPlanBoards, fetchCachedPlanBoardSubjects, getDailyTasks } from '../../common/planBoard';
import type { PlanTask } from '../../common/planBoard';
import { SUBJECT_CATEGORIES } from '@/constants/category';
import type { Category } from '@/constants/category';

// ================================
// Types
// ================================

/**
 * 퀴즈 탭에 보여줄 퀴즈 하나 (할일 + 과목)
 * @param subjectName 과목 이름, 보드에 과목이 여럿이면 빈 문자열
 */
export interface QuizItem {
  task: PlanTask;
  subjectName: string;
  category: Category;
}

// ================================
// Functions
// ================================

/**
 * 그날 퀴즈를 풀 수 있는 할일 목록을 시작 시간 순으로 조회
 * 할일 응답에 과목이 없어 AI 계획 보드별 그날 dailyPlanId 로 과목을 연결하고,
 * 직접 추가한 일정은 교과서가 없어 퀴즈를 만들 수 없으므로 뺌
 * @param date 조회할 날짜 (yyyy-MM-dd)
 */
export const getQuizItems = async (date: string): Promise<QuizItem[]> => {
  const [daily, boards] = await Promise.all([getDailyTasks(date), fetchCachedPlanBoards()]);
  const subjectByDailyPlanId = new Map<number, string>();
  await Promise.all(
    boards
      .filter((board) => board.examDate !== null)
      .map(async (board) => {
        const [boardDaily, subjects] = await Promise.all([
          fetchCachedBoardDaily(board.id, date),
          fetchCachedPlanBoardSubjects(board.id).catch(() => []),
        ]);
        if (typeof boardDaily.dailyPlanId !== "number") return;
        const names = [...new Set(subjects.map((subject) => subject.subjectName))];
        subjectByDailyPlanId.set(boardDaily.dailyPlanId, names.length === 1 ? names[0] : "");
      }),
  );

  return daily.tasks
    .filter((task) => subjectByDailyPlanId.has(task.dailyPlanId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((task) => {
      const subjectName = subjectByDailyPlanId.get(task.dailyPlanId) ?? "";
      return { task, subjectName, category: SUBJECT_CATEGORIES[subjectName] ?? "neutral" };
    });
};
