import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, BackHeader, PageTitle, NextButton, MonthNavigator, DateGrid } from "@/components";
import { toLocalDateString } from "@/utils/common/date";

/**
 * 시험 날짜 선택 화면
 */
export default function ExamDatePage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  };

  const handleNext = () => {
    if (!selectedDate) return;
    router.push({ pathname: "/Home/TextbookSelectPage", params: { examDate: toLocalDateString(selectedDate) } });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/Home"));

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      <PageTitle title="시험 날짜 선택" description="시험 날짜를 선택해주세요" className="pb-spacing-6 border-b border-neutral-600" />

      <Stack gap="m" width="full" className="pt-spacing-6 flex-1">
        <MonthNavigator year={viewYear} month={viewMonth} onPrev={goPrevMonth} onNext={goNextMonth} />
        <DateGrid viewYear={viewYear} viewMonth={viewMonth} today={today} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </Stack>

      <NextButton onPress={handleNext} disabled={!selectedDate} className="mb-spacing-6" />
    </View>
  );
}
