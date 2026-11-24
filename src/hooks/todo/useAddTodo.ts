import { isAxiosError } from "axios";
import { useState } from "react";
import { createTodo } from "@/api/todo/AddTodo";
import { invalidatePlanQueries } from "@/api/queryClient";
import { PLAN_GENERATION_IN_PROGRESS_TASK_MESSAGE } from "@/constants/task";
import { normalizeClock } from "@/utils/common/time";
import type { TextbookWithSubject } from "@/components/home/Home/TextbookPicker";

// ================================
// Functions
// ================================

/**
 * 할 일 추가 실패 안내. 남은 기간을 만드는 중인 AI 계획의 아직 안 만든 날이면 기다려 달라고 안내 (rooter-back#405)
 * try 안에서 조건식을 쓰면 React Compiler 가 훅을 건너뛰어서 함수로 뺌
 * @param error createTodo() 가 던진 에러
 */
const getAddTodoErrorMessage = (error: unknown) =>
  isAxiosError(error) && error.response?.data?.code === "PLAN_GENERATION_IN_PROGRESS"
    ? PLAN_GENERATION_IN_PROGRESS_TASK_MESSAGE
    : "할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.";

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
    const textbookId = textbook?.id;
    let added = true;
    let failure: unknown = null;
    try {
      await createTodo(date, title.trim(), startTime, endTime, textbookId);
      invalidatePlanQueries();
    } catch (e) {
      failure = e;
      added = false;
    }
    if (!added) setError(getAddTodoErrorMessage(failure));
    setSubmitting(false);
    return added;
  };

  return { title, setTitle, startText, setStartText, endText, setEndText, textbook, setTextbook, error, canSubmit, submit };
}
