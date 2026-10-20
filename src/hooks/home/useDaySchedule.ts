import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getBusyTimes } from "@/api/busyTime";
import type { DailyBusyTime } from "@/api/busyTime";
import { getNextExamDate } from "@/api/home/Home";
import { buildBusyBlocks, getDDay } from "@/utils/home/timeline";

// ================================
// Hooks
// ================================

/**
 * useDaySchedule — 그날의 수면·학교·불가능 시간과 다가오는 시험 D-Day 조회
 * 화면에 다시 들어올 때마다 다시 불러옵니다.
 * @param selectedKey 보고 있는 날짜 (YYYY-MM-DD)
 * @param now 현재 시각, D-Day 계산에 씀
 * @returns busyBlocks(타임라인에 그릴 바쁜 시간), examDDay(가장 가까운 시험까지 남은 일수, 없으면 null)
 */
export function useDaySchedule(selectedKey: string, now: Date) {
  const [busyDay, setBusyDay] = useState<DailyBusyTime | null>(null);
  const [nextExamDate, setNextExamDate] = useState<string | null>(null);

  const loadBusyTimes = useCallback(() => {
    getBusyTimes(selectedKey, selectedKey)
      .then((busy) => setBusyDay(busy.days[0] ?? null))
      .catch(() => setBusyDay(null));
  }, [selectedKey]);

  const loadNextExam = useCallback(() => {
    getNextExamDate().then(setNextExamDate).catch(() => setNextExamDate(null));
  }, []);

  useFocusEffect(loadBusyTimes);
  useFocusEffect(loadNextExam);

  return {
    busyBlocks: buildBusyBlocks(busyDay),
    examDDay: nextExamDate ? getDDay(nextExamDate, now) : null,
  };
}
