import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeedback } from "@/api/quiz/FeedbackPage";
import { queryKeys } from "@/api/queryClient";
import { dailyPlansQueryOptions } from "@/hooks/home/usePlans";
import { toLocalDateString } from "@/utils/common/date";
import { getFeedbackNoticeDate } from "@/utils/home/feedbackNotice";

// ================================
// Hooks
// ================================

/**
 * useFeedbackNotice — 홈의 "오늘 공부 설문" 말풍선을 띄울지
 * 19시~다음 날 07시에, 그날 일일 계획이 있고 하루 설문을 아직 안 냈으면 띄웁니다. (자정이 지나면 어제 계획 기준)
 * 닫으면 그 날짜에는 앱을 다시 켤 때까지 띄우지 않습니다.
 * @param now 현재 시각 (홈의 useNow)
 * @returns visible, dailyPlanId(설문 화면에 넘길 계획 ID), close
 */
export function useFeedbackNotice(now: Date) {
  const [closedKey, setClosedKey] = useState<string | null>(null);
  const noticeDate = getFeedbackNoticeDate(now);
  const noticeKey = noticeDate ? toLocalDateString(noticeDate) : null;

  const dailyQuery = useQuery({
    ...dailyPlansQueryOptions(noticeKey ?? ""),
    enabled: !!noticeKey,
  });
  const dailyPlanId = noticeKey
    ? (dailyQuery.data?.chatDailyPlanId ?? null)
    : null;

  const feedbackQuery = useQuery({
    queryKey: queryKeys.feedback.daily(dailyPlanId ?? 0),
    queryFn: () => getFeedback(dailyPlanId!),
    enabled: dailyPlanId !== null,
  });
  const notSubmitted = feedbackQuery.isSuccess && feedbackQuery.data === null;

  const visible =
    dailyPlanId !== null && notSubmitted && closedKey !== noticeKey;
  const close = () => setClosedKey(noticeKey);

  return { visible, dailyPlanId, close };
}
