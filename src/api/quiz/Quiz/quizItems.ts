import { getDailyTasks } from '../../common/planBoard';
import type { PlanTask } from '../../common/planBoard';
import { SUBJECT_CATEGORIES } from '@/constants/category';
import type { Category } from '@/constants/category';

// ================================
// Types
// ================================

/**
 * 퀴즈 탭에 보여줄 퀴즈 하나 (할일 + 과목)
 * @param subjectName 과목 이름, 할일에 과목이 없으면 빈 문자열
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
 * 직접 추가한 일정은 AI 계획의 교과서 범위가 없어 퀴즈를 만들 수 없으므로 뺌
 * @param date 조회할 날짜 (yyyy-MM-dd)
 */
export const getQuizItems = async (date: string): Promise<QuizItem[]> => {
  const daily = await getDailyTasks(date);

  return daily.tasks
    .filter((task) => !task.isManual)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((task) => {
      const subjectName = task.subjectName?.trim() ?? "";
      return { task, subjectName, category: SUBJECT_CATEGORIES[subjectName] ?? "neutral" };
    });
};
