import type { PlanTask } from "@/api/common/planBoard";
import { FALLBACK_SUBJECT_NAME, SUBJECT_CATEGORIES, type Category } from "@/constants/category";

// ================================
// Types
// ================================

/**
 * 할 일 탭에서 과목 하나로 묶은 할 일
 * @param subjectName 과목 이름, 과목이 없는 할 일은 "기타"
 * @param category 과목 색
 * @param tasks 그 과목의 할 일 (받은 순서 그대로)
 */
export interface TaskGroup {
  subjectName: string;
  category: Category;
  tasks: PlanTask[];
}

// ================================
// Functions
// ================================

/**
 * 할 일을 과목별로 묶음. 과목은 처음 나온 순서대로 두고 "기타" 는 맨 뒤로 보냄
 * @param tasks 그날 할 일
 * @returns 과목별 묶음 배열, 할 일이 없으면 빈 배열
 */
export const groupTasksBySubject = (tasks: PlanTask[]): TaskGroup[] => {
  const tasksBySubject = new Map<string, PlanTask[]>();
  tasks.forEach((task) => {
    const subjectName = task.subjectName?.trim() || FALLBACK_SUBJECT_NAME;
    tasksBySubject.set(subjectName, [...(tasksBySubject.get(subjectName) ?? []), task]);
  });

  return [...tasksBySubject.entries()]
    .sort(([a], [b]) => Number(a === FALLBACK_SUBJECT_NAME) - Number(b === FALLBACK_SUBJECT_NAME))
    .map(([subjectName, groupTasks]) => ({
      subjectName,
      category: SUBJECT_CATEGORIES[subjectName] ?? "neutral",
      tasks: groupTasks,
    }));
};
