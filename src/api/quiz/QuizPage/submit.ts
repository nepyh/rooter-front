import { completeTask } from '../../planBoard';
import { submitTaskQuiz } from './quiz';
import type { TaskQuizResult } from './quiz';

/**
 * 할일 퀴즈 전체 제출. 통과하면 서버가 할일을 자동 완료하지만 완료 API 로 한 번 더 맞춤
 * (이미 완료면 그대로 성공, 완료 API 가 실패해도 채점 결과는 돌려줌)
 * @param taskId 할일 ID
 */
export const submitQuizAndComplete = async (taskId: number): Promise<TaskQuizResult> => {
  const result = await submitTaskQuiz(taskId);
  if (result.passed) await completeTask(taskId, true).catch(() => {});
  return result;
};
