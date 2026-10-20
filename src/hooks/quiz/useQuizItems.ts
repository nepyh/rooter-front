import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getQuizItems, type QuizItem } from "@/api/quiz/Quiz";
import { toLocalDateString } from "@/utils/date";
import { parseHHmm } from "@/utils/home/timeline";

// ================================
// Hooks
// ================================

/**
 * useQuizItems — 오늘 퀴즈를 진행 중·예정·완료로 나눠 조회. 화면에 다시 들어올 때마다 다시 불러옴
 * 끝났는데 완료하지 못한 할일은 실패라 어느 목록에도 넣지 않습니다.
 * @param now 현재 시각
 * @returns loaded, current(지금 시간에 걸친 퀴즈), upcoming(시작 전), completed(완료), isEmpty
 */
export function useQuizItems(now: Date) {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    getQuizItems(toLocalDateString(new Date()))
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);
  useFocusEffect(load);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const remaining = items.filter((item) => !item.task.isCompleted);
  const current = remaining.filter((item) => parseHHmm(item.task.startTime) <= nowMin && nowMin < parseHHmm(item.task.endTime));
  const upcoming = remaining.filter((item) => parseHHmm(item.task.startTime) > nowMin);
  const completed = items.filter((item) => item.task.isCompleted);

  return { loaded, current, upcoming, completed, isEmpty: current.length + upcoming.length + completed.length === 0 };
}
