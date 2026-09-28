import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { buildMonthWeeks } from "@/utils/date";
import { WEEKDAYS } from "@/constants/date";

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// ================================
// Components
// ================================

function DateGrid({ viewYear, viewMonth, today, selectedDate, onSelect }: {
  viewYear: number;
  viewMonth: number;
  today: Date;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}) {
  const weeks = buildMonthWeeks(viewYear, viewMonth);
  const todayString = toDateString(today);

  return (
    <Stack width="full">
      <Row width="full" className="border-b border-neutral-600 justify-center">
        {WEEKDAYS.map((weekday, i) => (
          <View key={weekday} className="flex-1 items-center px-m py-s">
            <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
          </View>
        ))}
      </Row>
      {weeks.map((week, i) => (
        <Row key={i} width="full" className={`justify-center ${i < weeks.length - 1 ? "border-b border-neutral-600" : ""}`} style={{ height: 87 }}>
          {week.map((cell, j) => {
            // 오늘(주황 동그라미)과 선택한 날짜(주황 네모박스)는 서로 다른 표시라 동시에 나타날 수 있습니다
            const isToday = toDateString(cell.date) === todayString;
            const isSelected = selectedDate !== null && toDateString(cell.date) === toDateString(selectedDate);
            return (
              <Pressable
                key={j}
                onPress={() => onSelect(cell.date)}
                className={`flex-1 items-center rounded-sm ${isToday ? "p-m" : "px-m py-l"}`}
                style={isSelected ? { borderWidth: 2, borderColor: "#F6482D", backgroundColor: "rgba(246,72,45,0.3)" } : undefined}
              >
                {isToday ? (
                  <View className="bg-primary-500 rounded-full items-center justify-center p-xs">
                    <Text variant="base-medium" color="primary">{cell.date.getDate()}</Text>
                  </View>
                ) : (
                  <Text variant="base-medium" color={cell.inMonth ? "primary" : "disabled"}>{cell.date.getDate()}</Text>
                )}
              </Pressable>
            );
          })}
        </Row>
      ))}
    </Stack>
  );
}

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
    router.push({ pathname: "/TextbookSelectPage", params: { examDate: toDateString(selectedDate) } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
      </Row>

      <Stack gap="s" width="full" className="pb-xl border-b border-neutral-600">
        <Text variant="title-medium" weight="semibold">시험 날짜 선택</Text>
        <Text variant="base-medium" color="secondary">시험 날짜를 선택해주세요</Text>
      </Stack>

      <Stack gap="m" width="full" className="pt-xl flex-1">
        <Row width="full" align="between" className="items-center">
          <Text variant="header-large" weight="semibold">{`${viewYear}년 ${viewMonth + 1}월`}</Text>
          <Row gap="xs" className="items-center">
            <Pressable onPress={goPrevMonth} className="p-xs rounded-full items-center justify-center">
              <Icon name="chevronLeft" size={24} />
            </Pressable>
            <Pressable onPress={goNextMonth} className="p-xs rounded-full items-center justify-center">
              <Icon name="chevronRight" size={24} />
            </Pressable>
          </Row>
        </Row>

        <DateGrid viewYear={viewYear} viewMonth={viewMonth} today={today} selectedDate={selectedDate} onSelect={setSelectedDate} />
      </Stack>

      <Pressable
        onPress={handleNext}
        disabled={!selectedDate}
        className="h-16 rounded-md items-center justify-center w-full mb-xl"
        style={{ backgroundColor: selectedDate ? "#F6482D" : "#3F4552" }}
      >
        <Text variant="base-medium" weight="medium" className="text-white">다음</Text>
      </Pressable>
    </View>
  );
}
