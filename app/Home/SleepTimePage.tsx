import { useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button, BackHeader, PageTitle, TimeRow, WheelBox, WheelColumn } from "@/components";
import { getSpacing } from "@/utils/token";
import { pad } from "@/utils/home/timeline";

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

// ================================
// Components
// ================================

/**
 * 수면 시간 선택 화면
 */
export default function SleepTimePage() {
  const { examDate, subjects } = useLocalSearchParams<{ examDate: string; subjects: string }>();
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinuteIndex, setWakeMinuteIndex] = useState(0);
  const [sleepHoursIndex, setSleepHoursIndex] = useState(SLEEP_HOURS.indexOf(7));
  const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);

  const wakeTime = `${HOUR_LABELS[wakeHour]}:${MINUTE_LABELS[wakeMinuteIndex]}`;
  const togglePicker = (target: PickerTarget) => setActivePicker((prev) => (prev === target ? null : target));

  const handleNext = () => {
    router.push({
      pathname: "/LearningSurvey/StudySurveyQuestion",
      params: {
        step: "1",
        answers: "",
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
