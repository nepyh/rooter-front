import { useState } from "react";
import { createTodo } from "@/api/todo/AddTodo";
import { invalidatePlanQueries } from "@/api/queryClient";
import { normalizeClock } from "@/utils/common/time";

// ================================
// Hooks
// ================================

/**
 * useAddTodo — 할 일 추가 입력값 관리와 제출
 * @param date 할 일 날짜 (yyyy-MM-dd)
 * @returns title, setTitle, startText, setStartText, endText, setEndText, error, canSubmit, submit(성공 여부를 돌려줌)
 */
export function useAddTodo(date: string | undefined) {
  const [title, setTitle] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
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
      await createTodo(date, title.trim(), startTime, endTime);
      invalidatePlanQueries();
      return true;
    } catch {
      setError("할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { title, setTitle, startText, setStartText, endText, setEndText, error, canSubmit, submit };
}
