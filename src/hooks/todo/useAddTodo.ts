import { isAxiosError } from "axios";
import { useState } from "react";
import { createTodo } from "@/api/todo/AddTodo";
import { invalidatePlanQueries } from "@/api/queryClient";
import { normalizeClock } from "@/utils/common/time";
import type { TextbookWithSubject } from "@/components/home/Home/TextbookPicker";

// ================================
// Hooks
// ================================

/**
 * useAddTodo — 할 일 추가 입력값 관리와 제출
 * @param date 할 일 날짜 (yyyy-MM-dd)
 * 과목(교과서)은 고르지 않아도 추가할 수 있고, 고르면 그 과목으로 퀴즈가 나오도록 서버에 함께 보냄
 * @returns title, setTitle, startText, setStartText, endText, setEndText, textbook, setTextbook, error, canSubmit, submit(성공 여부를 돌려줌)
 */
export function useAddTodo(date: string | undefined) {
  const [title, setTitle] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [textbook, setTextbook] = useState<TextbookWithSubject | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit || !date) return false;

    const startTime = normalizeClock(startText);
    const endTime = normalizeClock(endText);
    if (!startTime || !endTime) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return false;
    }

    setError("");
    setSubmitting(true);
    try {
      await createTodo(date, title.trim(), startTime, endTime, textbook?.id);
      invalidatePlanQueries();
      return true;
    } catch (e) {
      // 남은 기간을 만드는 중인 AI 계획의 아직 안 만든 날에는 추가할 수 없음 (rooter-back#405)
      const inProgress = isAxiosError(e) && e.response?.data?.code === "PLAN_GENERATION_IN_PROGRESS";
      setError(inProgress ? "이 날 계획은 아직 만드는 중이에요. 다 만들어진 뒤에 추가해주세요." : "할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { title, setTitle, startText, setStartText, endText, setEndText, textbook, setTextbook, error, canSubmit, submit };
}
