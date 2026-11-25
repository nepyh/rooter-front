import { useState } from "react";
import { router } from "expo-router";
import { ExamDateScreen } from "@/components";
import { usePlanDraftStore } from "@/store";
import { PLAN_MAX_DAYS } from "@/constants/plan";
import { addDays, toLocalDateString } from "@/utils/common/date";
import { parseLocalDate } from "@/utils/home/planBoard";

/**
 * 시험 시작 날짜 선택 화면. 고른 날짜를 플랜 만들기 내용에 저장하고 시험 종료 날짜 선택 화면으로 넘어감
 * 계획은 시험 첫날 전날까지 최대 PLAN_MAX_DAYS 일이라, 시험 첫날은 오늘 + PLAN_MAX_DAYS 일까지 고를 수 있음
 */
export default function ExamStartDatePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = usePlanDraftStore.getState().examStartDate;
    return saved ? parseLocalDate(saved) : null;
  });
  const setExamStartDate = usePlanDraftStore((state) => state.setExamStartDate);

  const handleNext = () => {
    if (!selectedDate) return;
    setExamStartDate(toLocalDateString(selectedDate));
    router.push("/Home/ExamEndDatePage");
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/PlanInfoPage"));

  return (
    <ExamDateScreen
      title="시험 시작 날짜 선택"
      description="시험이 시작되는 날짜를 선택해주세요"
      selectedDate={selectedDate}
      onSelect={setSelectedDate}
      onNext={handleNext}
      onBack={goBack}
      maxDate={addDays(new Date(), PLAN_MAX_DAYS)}
    />
  );
}
