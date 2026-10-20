import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import {
  getFeedback,
  getSubmitErrorMessage,
  isAlreadySubmitted,
  submitFeedback,
  type Difficulty,
  type Feedback,
} from "@/api/quiz/FeedbackPage";
import { diffMinutes, roundedNow } from "@/utils/quiz/feedback";

// ================================
// Types
// ================================

export type TimePickerTarget = "start" | "end";

// ================================
// Hooks
// ================================

/**
 * useFeedback — 학습 피드백(난이도·집중도·공부한 시간) 입력과 제출
 * 피드백은 일일 계획당 1번이라 이미 제출했으면 바로 Home 으로 보냅니다.
 * 세 항목 모두 필수라 빠진 항목이 있으면 제출 대신 필수 안내를 켜고, 제출 전에는 안드로이드 뒤로가기를 막습니다.
 * @param planId 일일 계획 ID (0 이면 계획 없음)
 */
export function useFeedback(planId: number) {
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(() => roundedNow(60));
  const [endTime, setEndTime] = useState(() => roundedNow());
  const [activePicker, setActivePicker] = useState<TimePickerTarget | null>(null);
  const [showRequired, setShowRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Feedback | null>(null);

  const timeSpent = diffMinutes(startTime, endTime);
  const missing = { difficulty: !difficulty, focus: focusLevel === null, time: timeSpent <= 0 };
  const mustSubmit = !loading && !!planId && !result;

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    getFeedback(planId)
      .then(() => router.replace("/Home/Home"))
      .catch(() => setLoading(false));
  }, [planId]);

  useEffect(() => {
    if (!mustSubmit) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, [mustSubmit]);

  const togglePicker = (target: TimePickerTarget) => setActivePicker((prev) => (prev === target ? null : target));

  const submit = async () => {
    if (!planId || submitting) return;
    if (!difficulty || focusLevel === null || missing.time) {
      setShowRequired(true);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      setResult(await submitFeedback(planId, { difficulty, timeSpentMinutes: timeSpent, focusLevel }));
    } catch (e) {
      if (isAlreadySubmitted(e)) getFeedback(planId).then(setResult).catch(() => setError("이미 제출한 피드백이 있어요."));
      else setError(getSubmitErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    difficulty,
    setDifficulty,
    focusLevel,
    setFocusLevel,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    activePicker,
    togglePicker,
    missing,
    showRequired,
    submitting,
    error,
    result,
    submit,
  };
}
