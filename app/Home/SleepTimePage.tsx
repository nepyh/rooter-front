import { useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button, BackHeader, PageTitle, TimeRow, WheelBox, WheelColumn } from "@/components";
import { getSpacing } from "@/utils/common/token";
import { pad } from "@/utils/common/time";
import { fromSleepTime } from "@/utils/home/sleepTime";
import type { SleepTimeInput } from "@/api/common/user";
import { useSleepTime } from "@/hooks/home/useSleepTime";

// ================================
// Types
// ================================

type PickerTarget = "wake" | "sleep";

// ================================
// Constants
// ================================

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTE_LABELS = Array.from({ length: 6 }, (_, i) => pad(i * 10));
const SLEEP_HOURS = Array.from({ length: 9 }, (_, i) => i + 4);
const SLEEP_HOUR_LABELS = SLEEP_HOURS.map((h) => `${h}시간`);

const DEFAULT_PICKER = { wakeHour: 7, wakeMinuteIndex: 0, sleepHoursIndex: SLEEP_HOURS.indexOf(7) };

// ================================
// Helpers
// ================================

/**
 * 저장된 수면 시간을 휠 선택 위치로 바꿈. 화면 단위(10분, 1시간)에 안 맞는 값은 기본값 사용
 * @param sleepTime 저장된 수면 시간, 없으면 null
 */
const toPickerValues = (sleepTime: SleepTimeInput | null) => {
  if (!sleepTime) return DEFAULT_PICKER;
  const { wakeMin, sleepHours } = fromSleepTime(sleepTime);
  const wakeFits = wakeMin % 10 === 0;
  return {
    wakeHour: wakeFits ? Math.floor(wakeMin / 60) : DEFAULT_PICKER.wakeHour,
    wakeMinuteIndex: wakeFits ? (wakeMin % 60) / 10 : DEFAULT_PICKER.wakeMinuteIndex,
    sleepHoursIndex: SLEEP_HOURS.includes(sleepHours) ? SLEEP_HOURS.indexOf(sleepHours) : DEFAULT_PICKER.sleepHoursIndex,
  };
};

// ================================
// Components
// ================================

/**
 * 수면 시간 선택 화면
 */
export default function SleepTimePage() {
  const { examDate, subjects } = useLocalSearchParams<{ examDate: string; subjects: string }>();
  const savedPicker = toPickerValues(useSleepTime());
  // 직접 고르기 전에는 저장된 수면 시간, 없으면 기본값을 보여줌
  const [pickedWakeHour, setWakeHour] = useState<number | null>(null);
  const [pickedWakeMinuteIndex, setWakeMinuteIndex] = useState<number | null>(null);
  const [pickedSleepHoursIndex, setSleepHoursIndex] = useState<number | null>(null);
  const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);

  const wakeHour = pickedWakeHour ?? savedPicker.wakeHour;
  const wakeMinuteIndex = pickedWakeMinuteIndex ?? savedPicker.wakeMinuteIndex;
  const sleepHoursIndex = pickedSleepHoursIndex ?? savedPicker.sleepHoursIndex;

  const wakeTime = `${HOUR_LABELS[wakeHour]}:${MINUTE_LABELS[wakeMinuteIndex]}`;
  const togglePicker = (target: PickerTarget) => setActivePicker((prev) => (prev === target ? null : target));

  const handleNext = () => {
    router.push({
      pathname: "/LearningSurvey/StudySurveyIntro",
      params: {
        plan: JSON.stringify({ examDate, subjects, wakeTime, sleepHours: SLEEP_HOURS[sleepHoursIndex] }),
      },
    });
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/ExamDatePage"));

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <BackHeader onBack={goBack} />
      <PageTitle title="수면 시간 선택" description="기상 시간과 목표 취침 시간을 입력해주세요" className="pb-spacing-9" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: getSpacing("spacing-5"), paddingBottom: getSpacing("spacing-9") }}>
        <TimeRow label="기상 시간" value={wakeTime} active={activePicker === "wake"} onPress={() => togglePicker("wake")}>
          <WheelBox>
            <WheelColumn data={HOUR_LABELS} selectedIndex={wakeHour} onChange={setWakeHour} />
            <WheelColumn data={MINUTE_LABELS} selectedIndex={wakeMinuteIndex} onChange={setWakeMinuteIndex} />
          </WheelBox>
        </TimeRow>
        <TimeRow label="목표 취침 시간" value={SLEEP_HOUR_LABELS[sleepHoursIndex]} active={activePicker === "sleep"} onPress={() => togglePicker("sleep")}>
          <WheelBox>
            <WheelColumn data={SLEEP_HOUR_LABELS} selectedIndex={sleepHoursIndex} onChange={setSleepHoursIndex} width={96} />
          </WheelBox>
        </TimeRow>
      </ScrollView>

      <View className="pt-spacing-5 pb-spacing-6">
        <Button variant="primary" onPress={handleNext}>다음</Button>
      </View>
    </Animated.View>
  );
}
