import { useState } from "react";
import { router } from "expo-router";
import { ExamDateScreen } from "@/components";
import { usePlanDraftStore } from "@/store";
import { PLAN_MAX_AHEAD_YEARS } from "@/constants/plan";
import { addYears, toLocalDateString } from "@/utils/common/date";
import { parseLocalDate } from "@/utils/home/planBoard";

/**
 * 시험 종료 날짜 선택 화면. 시험 시작일부터 고를 수 있고, 시작일과 같은 날을 고르면 하루만 시험을 보는 것으로 봄
 * 고른 날짜를 플랜 만들기 내용에 저장하고 교과서 선택 화면으로 넘어감
 * 종료일은 오늘 + PLAN_MAX_AHEAD_YEARS 년까지 고를 수 있음
 */
export default function ExamEndDatePage() {
  const examStartDate = usePlanDraftStore((state) => state.examStartDate);
  const setExamEndDate = usePlanDraftStore((state) => state.setExamEndDate);
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = usePlanDraftStore.getState().examEndDate;
    return saved ? parseLocalDate(saved) : null;
  });
  const startDate = examStartDate ? parseLocalDate(examStartDate) : undefined;

  const handleNext = () => {
    if (!selectedDate) return;
    setExamEndDate(toLocalDateString(selectedDate));
    router.push("/Home/TextbookSelectPage");
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/ExamStartDatePage"));

  return (
    <ExamDateScreen
      title="시험 종료 날짜 선택"
      description="시험이 끝나는 날짜를 선택해주세요. 하루만 보면 시작 날짜를 한 번 더 선택해주세요"
      selectedDate={selectedDate}
      onSelect={setSelectedDate}
      onNext={handleNext}
      onBack={goBack}
      minDate={startDate}
      maxDate={addYears(new Date(), PLAN_MAX_AHEAD_YEARS)}
      rangeStart={startDate}
    />
  );
}
