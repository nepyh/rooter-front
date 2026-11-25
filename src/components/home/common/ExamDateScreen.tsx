import { useState } from "react";
import { View, ViewProps } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { Stack } from "../../layout";
import { BackHeader } from "./BackHeader";
import { PageTitle } from "./PageTitle";
import { NextButton } from "./NextButton";
import { MonthNavigator } from "./MonthNavigator";
import { DateGrid } from "./DateGrid";
import { useMonthSwipe } from "@/hooks/common/useMonthSwipe";

// ================================
// Types
// ================================

type SlideDirection = "next" | "prev";

// ================================
// Constants
// ================================

// 캘린더 탭(MonthGrid)과 같은 시간·방향으로 새 달이 밀려 들어옴
const SLIDE_MS = 260;

const slideInAnimations: Record<SlideDirection, typeof SlideInRight> = {
  "next": SlideInRight,
  "prev": SlideInLeft,
};

// ================================
// Helpers
// ================================

const toMonthIndex = (year: number, month: number) => year * 12 + month;

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
  maxDate?: Date;
  rangeStart?: Date;
  className?: string;
}

/**
 * 플랜 만들기에서 시험 날짜를 고르는 화면 틀. 위에 제목·설명, 가운데 한 달 달력, 아래에 다음 버튼을 배치하고 날짜를 고르기 전에는 다음 버튼이 눌리지 않음
 * 처음에는 고른 날짜, 없으면 고를 수 있는 가장 이른 날짜, 그것도 없으면 오늘이 속한 달을 보여줌
 * 달력을 좌우로 끌거나 위쪽 화살표로 달을 넘기면 넘긴 방향에서 새 달이 밀려 들어옴
 * @param title 화면 제목
 * @param description 제목 아래 설명 문구
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param onNext 다음 버튼을 눌렀을 때 호출
 * @param onBack 뒤로가기 버튼을 눌렀을 때 호출
 * @param minDate 고를 수 있는 가장 이른 날짜, 생략하면 내일부터
 * @param maxDate 고를 수 있는 가장 늦은 날짜. 이 날짜의 달 이후로는 넘길 수 없음, 생략하면 제한 없음
 * @param rangeStart 기간의 시작일. 주면 이 날부터 고른 날까지를 달력에 함께 표시
 */
export function ExamDateScreen({ title, description, selectedDate, onSelect, onNext, onBack, minDate, maxDate, rangeStart, className = "", ...props }: Props) {
  const today = new Date();
  const initialView = selectedDate ?? minDate ?? today;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  // 처음 열 때는 밀려 들어오지 않고, 한 번이라도 넘긴 뒤부터 넘긴 방향으로 애니메이션
  const [direction, setDirection] = useState<SlideDirection | null>(null);
  const monthKey = `${viewYear}-${viewMonth}`;
  const canGoNext = !maxDate || toMonthIndex(viewYear, viewMonth) < toMonthIndex(maxDate.getFullYear(), maxDate.getMonth());

  const goPrevMonth = () => {
    setDirection("prev");
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    setDirection("next");
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  };

  const swipe = useMonthSwipe(monthKey, goPrevMonth, goNextMonth, true, canGoNext);
  const entering = direction ? slideInAnimations[direction].duration(SLIDE_MS) : undefined;

  return (
    <View className={`flex-1 ${className}`} {...props}>
      <StatusBar style="light" />
      <BackHeader onBack={onBack} />
      <PageTitle title={title} description={description} className="pb-spacing-6 border-b border-neutral-600" />

      <Stack gap="m" width="full" className="pt-spacing-6 pb-spacing-4 flex-1">
        <MonthNavigator year={viewYear} month={viewMonth} onPrev={goPrevMonth} onNext={goNextMonth} canGoNext={canGoNext} />
        <GestureDetector gesture={swipe.gesture}>
          <Animated.View style={[{ flex: 1 }, swipe.animatedStyle]} onLayout={swipe.onLayout}>
            <Animated.View key={monthKey} entering={entering} style={{ flex: 1 }}>
              <DateGrid
                viewYear={viewYear}
                viewMonth={viewMonth}
                today={today}
                selectedDate={selectedDate}
                onSelect={onSelect}
                minDate={minDate}
                maxDate={maxDate}
                rangeStart={rangeStart}
                className="flex-1"
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Stack>

      <NextButton onPress={onNext} disabled={!selectedDate} className="mb-spacing-6" />
    </View>
  );
}
