import { useEffect, useRef, useState } from "react";
import {
  answerTaskQuizQuestion,
  getQuizErrorMessage,
  getTaskQuiz,
  isAlreadyAnswered,
  submitTaskQuiz,
  type TaskQuiz,
  type TaskQuizAnswerResult,
  type TaskQuizResult,
} from "@/api/quiz/QuizPage";
import { invalidateTaskQueries } from "@/api/queryClient";
import { getOptionState, pickCorrectMessage } from "@/utils/quiz/quiz";

// ================================
// Types
// ================================

export type QuizPhase = "intro" | "answering" | "review" | "score";

// ================================
// Hooks
// ================================

/**
 * useTaskQuiz — 할일 완료 확인 퀴즈의 진행 상태 관리
 * 시작 → 문제마다 [확인]으로 바로 채점 → 마지막 문제 뒤 전체 제출 → 풀이 보기 → 점수 순으로 진행합니다.
 * 시작 화면을 보는 동안 퀴즈를 미리 불러오고, 이미 답한 문제는 건너뛰고 안 푼 문제부터 이어 풉니다.
 * @param taskId 할일 ID (문자열)
 */
export function useTaskQuiz(taskId: string | undefined) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<TaskQuiz | null>(null);
  const [serverSubject, setServerSubject] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState<Record<number, TaskQuizAnswerResult>>({});
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<TaskQuizResult | null>(null);
  const prefetchRef = useRef<Promise<TaskQuiz> | null>(null);
  const correctMessagesRef = useRef<Record<number, string>>({});

  const questions = quiz?.questions ?? [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedChoiceId = current ? answers[current.id] : undefined;
  const currentGrade = current ? graded[current.id] : undefined;
  const reviewResult = phase === "review" && current ? result?.results.find((r) => r.questionId === current.id) : undefined;

  useEffect(() => {
    const id = Number(taskId);
    if (!id) return;
    const request = getTaskQuiz(id);
    prefetchRef.current = request;
    request.then((data) => setServerSubject(data.subject?.subjectName ?? null)).catch(() => {});
  }, [taskId]);

  const getCorrectMessage = (questionId: number) => {
    correctMessagesRef.current[questionId] ??= pickCorrectMessage();
    return correctMessagesRef.current[questionId];
  };

  const submit = async (id: number) => {
    setChecking(true);
    setError("");
    try {
      setResult(await submitTaskQuiz(id));
      invalidateTaskQueries();
      setCurrentIndex(0);
      setPhase("review");
    } catch (e) {
      setError(getQuizErrorMessage(e, "채점 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setChecking(false);
    }
  };

  const start = async () => {
    const id = Number(taskId);
    setPhase("answering");
    if (!id) {
      setError("퀴즈를 풀 할 일을 찾지 못했어요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const prefetched = prefetchRef.current;
      prefetchRef.current = null;
      const data = await (prefetched ? prefetched.catch(() => getTaskQuiz(id)) : getTaskQuiz(id));
      setServerSubject(data.subject?.subjectName ?? null);
      setQuiz(data);
      setAnswers(Object.fromEntries(data.questions.filter((q) => q.selectedChoiceId !== null).map((q) => [q.id, q.selectedChoiceId as number])));
      const firstOpen = data.questions.findIndex((q) => q.selectedChoiceId === null);
      if (firstOpen === -1) await submit(id);
      else setCurrentIndex(firstOpen);
    } catch (e) {
      setError(getQuizErrorMessage(e, "퀴즈를 준비하지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setLoading(false);
    }
  };

  const select = (choiceId: number) => {
    if (!current || currentGrade) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceId }));
  };

  const next = () => {
    if (!quiz) return;
    if (isLast) submit(quiz.planTaskId);
    else setCurrentIndex((i) => i + 1);
  };

  const confirm = async () => {
    if (!current || selectedChoiceId === undefined || !quiz) return;
    setChecking(true);
    setError("");
    try {
      const grade = await answerTaskQuizQuestion(quiz.planTaskId, current.id, selectedChoiceId);
      setGraded((prev) => ({ ...prev, [current.id]: grade }));
    } catch (e) {
      if (isAlreadyAnswered(e)) next();
      else setError(getQuizErrorMessage(e, "채점하지 못했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setChecking(false);
    }
  };

  const reviewNext = () => {
    if (isLast) setPhase("score");
    else setCurrentIndex((i) => i + 1);
  };

  const bubbleText = reviewResult
    ? reviewResult.explanation || `정답은 ${reviewResult.correctChoiceText}입니다.`
    : currentGrade
      ? currentGrade.isCorrect ? getCorrectMessage(current?.id ?? currentIndex) : currentGrade.reason ?? "아쉽지만 오답이에요."
      : null;

  return {
    phase,
    loading,
    error,
    serverSubject,
    questions,
    current,
    currentIndex,
    isLast,
    selectedChoiceId,
    currentGrade,
    reviewResult,
    checking,
    result,
    bubbleText,
    optionStateOf: (choiceId: number) => getOptionState(choiceId, selectedChoiceId, currentGrade, reviewResult),
    start,
    select,
    confirm,
    next,
    reviewNext,
  };
}
