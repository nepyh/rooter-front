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
import { TASK_NOT_STARTED_MESSAGE } from "@/constants/task";
import { hasTaskStarted } from "@/utils/common/time";
import { getOptionState, pickCorrectMessage } from "@/utils/quiz/quiz";

// ================================
// Types
// ================================

export type QuizPhase = "intro" | "answering" | "review" | "score";

/**
 * 퀴즈를 풀 할일의 시작 시각
 * @param date 할일 날짜 (yyyy-MM-dd)
 * @param startTime 시작 시각 ("HH:MM")
 */
export interface TaskStart {
  date: string;
  startTime: string;
}

// ================================
// Hooks
// ================================

/**
 * useTaskQuiz — 할일 완료 확인 퀴즈의 진행 상태 관리
 * 시작 → 문제마다 [확인]으로 바로 채점 → 마지막 문제 뒤 전체 제출 → 풀이 보기 → 점수 순으로 진행합니다.
 * 채점한 문제는 [해설 보기]로 그 자리에서 해설을 펼쳐 볼 수 있고, 마지막 풀이 보기도 그대로 거칩니다.
 * 시작 화면을 보는 동안 퀴즈를 미리 불러오고, 이미 답한 문제는 건너뛰고 안 푼 문제부터 이어 풉니다.
 * 시작 시각을 받으면 시작 전에는 퀴즈를 부르지 않고 안내를 띄움 (어느 화면에서 들어와도 막는 안전장치, 없으면 서버 TASK_NOT_STARTED 로 막힘)
 * @param taskId 할일 ID (문자열)
 * @param taskStart 할일 시작 시각
 */
export function useTaskQuiz(taskId: string | undefined, taskStart?: TaskStart) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<TaskQuiz | null>(null);
  const [serverSubject, setServerSubject] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState<Record<number, TaskQuizAnswerResult>>({});
  const [checking, setChecking] = useState(false);
  // 해설을 펼친 문제 id, 채점 직후에는 정답·오답 문구를 먼저 보여주고 버튼을 누르면 해설로 바꿈
  const [explanationOpenId, setExplanationOpenId] = useState<number | null>(null);
  const [result, setResult] = useState<TaskQuizResult | null>(null);
  const prefetchRef = useRef<Promise<TaskQuiz> | null>(null);
  const correctMessagesRef = useRef<Record<number, string>>({});

  const questions = quiz?.questions ?? [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedChoiceId = current ? answers[current.id] : undefined;
  const currentGrade = current ? graded[current.id] : undefined;
  const reviewResult = phase === "review" && current ? result?.results.find((r) => r.questionId === current.id) : undefined;

  const startDate = taskStart?.date;
  const startTime = taskStart?.startTime;
  const isNotStarted = () => !!startDate && !!startTime && !hasTaskStarted(startDate, startTime, new Date());

  useEffect(() => {
    const id = Number(taskId);
    if (!id) return;
    if (startDate && startTime && !hasTaskStarted(startDate, startTime, new Date())) return;
    const request = getTaskQuiz(id);
    prefetchRef.current = request;
    request.then((data) => setServerSubject(data.subject?.subjectName ?? null)).catch(() => {});
  }, [taskId, startDate, startTime]);

  const getCorrectMessage = (questionId: number) => {
    if (correctMessagesRef.current[questionId] === undefined) correctMessagesRef.current[questionId] = pickCorrectMessage();
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
    }
    setChecking(false);
  };

  const start = async () => {
    const id = Number(taskId);
    setPhase("answering");
    if (!id) {
      setError("퀴즈를 풀 할 일을 찾지 못했어요.");
      return;
    }
    if (isNotStarted()) {
      setError(TASK_NOT_STARTED_MESSAGE);
      return;
    }
    setLoading(true);
    setError("");
    // 미리 받아 둔 요청이 있으면 그걸 쓰고, 실패했으면 다시 받음
    const loadQuiz = () => {
      const prefetched = prefetchRef.current;
      prefetchRef.current = null;
      return prefetched ? prefetched.catch(() => getTaskQuiz(id)) : getTaskQuiz(id);
    };

    let data: Awaited<ReturnType<typeof getTaskQuiz>> | null = null;
    try {
      data = await loadQuiz();
    } catch (e) {
      setError(getQuizErrorMessage(e, "퀴즈를 준비하지 못했습니다. 잠시 후 다시 시도해주세요."));
    }
    if (!data) {
      setLoading(false);
      return;
    }

    setServerSubject(data.subject?.subjectName ?? null);
    setQuiz(data);
    setAnswers(Object.fromEntries(data.questions.filter((q) => q.selectedChoiceId !== null).map((q) => [q.id, q.selectedChoiceId as number])));
    const firstOpen = data.questions.findIndex((q) => q.selectedChoiceId === null);
    if (firstOpen === -1) await submit(id);
    else setCurrentIndex(firstOpen);
    setLoading(false);
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
    }
    setChecking(false);
  };

  const reviewNext = () => {
    if (isLast) setPhase("score");
    else setCurrentIndex((i) => i + 1);
  };

  const gradeExplanation = currentGrade?.explanation?.trim() || null;
  const explanationOpen = !!current && explanationOpenId === current.id && !!gradeExplanation;

  const toggleExplanation = () => {
    if (!current) return;
    setExplanationOpenId((prev) => (prev === current.id ? null : current.id));
  };

  const bubbleText = reviewResult
    ? reviewResult.explanation || `정답은 ${reviewResult.correctChoiceText}입니다.`
    : currentGrade
      ? explanationOpen
        ? gradeExplanation
        : currentGrade.isCorrect ? getCorrectMessage(current?.id ?? currentIndex) : currentGrade.reason ?? "아쉽지만 오답이에요."
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
    hasExplanation: phase === "answering" && !!gradeExplanation,
    explanationOpen,
    toggleExplanation,
    optionStateOf: (choiceId: number) => getOptionState(choiceId, selectedChoiceId, currentGrade, reviewResult),
    start,
    select,
    confirm,
    next,
    reviewNext,
  };
}
