import { useState } from "react";
import { View, ViewProps } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "../../layout";
import { BackHeader } from "./BackHeader";
import { PageTitle } from "./PageTitle";
import { NextButton } from "./NextButton";
import { MonthNavigator } from "./MonthNavigator";
import { DateGrid } from "./DateGrid";

// ================================
// Components
// ================================

interface Props extends ViewProps {
  title: string;
  description: string;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
  minDate?: Date;
  rangeStart?: Date;
  className?: string;
}

/**
 * 플랜 만들기에서 시험 날짜를 고르는 화면 틀. 위에 제목·설명, 가운데 한 달 달력, 아래에 다음 버튼을 배치하고 날짜를 고르기 전에는 다음 버튼이 눌리지 않음
 * 처음에는 고른 날짜, 없으면 고를 수 있는 가장 이른 날짜, 그것도 없으면 오늘이 속한 달을 보여줌
 * @param title 화면 제목
 * @param description 제목 아래 설명 문구
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param onNext 다음 버튼을 눌렀을 때 호출
 * @param onBack 뒤로가기 버튼을 눌렀을 때 호출
 * @param minDate 고를 수 있는 가장 이른 날짜, 생략하면 내일부터
 * @param rangeStart 기간의 시작일. 주면 이 날부터 고른 날까지를 달력에 함께 표시
 */
export function ExamDateScreen({ title, description, selectedDate, onSelect, onNext, onBack, minDate, rangeStart, className = "", ...props }: Props) {
  const today = new Date();
  const initialView = selectedDate ?? minDate ?? today;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  };

  return (
    <View className={`flex-1 ${className}`} {...props}>
      <StatusBar style="light" />
      <BackHeader onBack={onBack} />
      <PageTitle title={title} description={description} className="pb-spacing-6 border-b border-neutral-600" />

      <Stack gap="m" width="full" className="pt-spacing-6 flex-1">
        <MonthNavigator year={viewYear} month={viewMonth} onPrev={goPrevMonth} onNext={goNextMonth} />
        <DateGrid
          viewYear={viewYear}
          viewMonth={viewMonth}
          today={today}
          selectedDate={selectedDate}
          onSelect={onSelect}
          minDate={minDate}
          rangeStart={rangeStart}
        />
      </Stack>

      <NextButton onPress={onNext} disabled={!selectedDate} className="mb-spacing-6" />
    </View>
  );
}
