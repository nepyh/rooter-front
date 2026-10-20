import { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Button, Text } from "@/components";
import { Icon } from "@/assets";
import { getSpacing } from "@/utils/token";

// ================================
// Types
// ================================

type PickerTarget = "wake" | "sleep";

// ================================
// Constants
// ================================

const pad = (n: number) => String(n).padStart(2, "0");

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => pad(i));
// 기상 시간은 10분 단위
const MINUTE_LABELS = Array.from({ length: 6 }, (_, i) => pad(i * 10));
// 목표 취침 시간 4~12시간
const SLEEP_HOURS = Array.from({ length: 9 }, (_, i) => i + 4);
const SLEEP_HOUR_LABELS = SLEEP_HOURS.map((h) => `${h}시간`);

// 휠 한 칸 높이와 한 번에 보이는 칸 수
const WHEEL_ITEM_HEIGHT = 40;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

// ================================
// Components
// ================================

function WheelColumn({ data, selectedIndex, onChange, width = 64 }: {
  data: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingRows = Math.floor(WHEEL_VISIBLE_ROWS / 2);

  const selectRow = (row: number) => {
    const index = Math.max(0, Math.min(data.length - 1, row));
    scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated: true });
    onChange(index);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    selectRow(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, width }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      onScrollEndDrag={handleScrollEnd}
      onMomentumScrollEnd={handleScrollEnd}
      onLayout={() => scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_HEIGHT, animated: false })}
      contentContainerStyle={{ paddingVertical: WHEEL_ITEM_HEIGHT * paddingRows }}
    >
      {data.map((label, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable key={label} onPress={() => selectRow(index)} style={{ height: WHEEL_ITEM_HEIGHT }} className="items-center justify-center">
            <Text variant="base-large" weight={isSelected ? "medium" : "regular"} color={isSelected ? "primary" : "disabled"}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// 가운데 선택 줄 표시 + 휠 컬럼들
function WheelBox({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-neutral-800 rounded-radius-4 flex-row justify-center" style={{ height: WHEEL_HEIGHT }}>
      <View
        pointerEvents="none"
        className="absolute left-spacing-0 right-spacing-0 rounded-radius-3 bg-neutral-500/30"
        style={{ top: WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2), height: WHEEL_ITEM_HEIGHT }}
      />
      {children}
    </View>
  );
}

function TimeRow({ label, value, active, onPress, children }: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="w-full bg-neutral-700 rounded-radius-4 px-spacing-6 py-spacing-5" style={{ gap: getSpacing("spacing-5") }}>
      <Pressable onPress={onPress} className="flex-row items-center justify-between w-full" style={{ minHeight: 34 }}>
        <Text variant="base-large" weight="medium">{label}</Text>
        <View className={`px-spacing-4 py-spacing-3 rounded-radius-full ${active ? "bg-primary-500" : "bg-neutral-600"}`}>
          <Text variant="base-small">{value}</Text>
        </View>
      </Pressable>
      {/* 누른 칸만 휠을 펼침 */}
      {active && children}
    </View>
  );
}

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

  // 수면 시간 저장 API가 아직 없어 설문 뒤 플랜 생성까지 값만 넘김
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

  // 새로고침·링크로 바로 열려 돌아갈 화면이 없으면 시험 날짜 선택으로
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/Home/ExamDatePage"));

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-spacing-5">
        <Pressable onPress={goBack}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
      </Row>

      <Stack gap="s" width="full" className="pb-spacing-9">
        <Text variant="title-medium" weight="semibold">수면 시간 선택</Text>
        <Text variant="base-medium" color="secondary">기상 시간과 목표 취침 시간을 입력해주세요</Text>
      </Stack>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: getSpacing("spacing-5"), paddingBottom: getSpacing("spacing-9") }}>
        <TimeRow label="기상 시간" value={wakeTime} active={activePicker === "wake"} onPress={() => togglePicker("wake")}>
          <WheelBox>
            <WheelColumn data={HOUR_LABELS} selectedIndex={wakeHour} onChange={setWakeHour} />
            <WheelColumn data={MINUTE_LABELS} selectedIndex={wakeMinuteIndex} onChange={setWakeMinuteIndex} />
          </WheelBox>
        </TimeRow>
        <TimeRow
          label="목표 취침 시간"
          value={SLEEP_HOUR_LABELS[sleepHoursIndex]}
          active={activePicker === "sleep"}
          onPress={() => togglePicker("sleep")}
        >
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
