import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import { Icon } from "@/assets";
import { addUnavailableTime, getUnavailableTimes, DAY_OF_WEEK_LABELS, DAY_OF_WEEK_NAMES } from "@/api/user";
import type { UnavailableTime } from "@/api/user";
import { useUserStore } from "@/store";
import { getSpacing } from "@/utils/token";

// ================================
// Helpers
// ================================

const parseClock = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ================================
// Components
// ================================

function UnavailableTimeRow({ item }: { item: UnavailableTime }) {
  const dayLabel = DAY_OF_WEEK_LABELS[DAY_OF_WEEK_NAMES.indexOf(item.dayOfWeek)];
  return (
    <Row gap="m" className="items-center bg-neutral-700 p-spacing-5 rounded-radius-4 w-full">
      <View className="px-spacing-4 py-spacing-2 rounded-radius-2 bg-neutral-600">
        <Text variant="base-medium" weight="medium">{dayLabel}</Text>
      </View>
      <Text variant="base-medium">{`${item.startTime} - ${item.endTime}`}</Text>
    </Row>
  );
}

/**
 * 불가능 시간 화면
 */
export default function UnavailableTimePage() {
  const userId = useUserStore((state) => state.userId);
  const [items, setItems] = useState<UnavailableTime[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId === null) return;
    getUnavailableTimes(userId).then(setItems).catch(() => setItems([]));
  }, [userId]);

  const handleAdd = async () => {
    if (userId === null || submitting) return;

    const startTime = parseClock(startText);
    const endTime = parseClock(endText);
    if (!startTime || !endTime) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const created = await addUnavailableTime(userId, { dayOfWeek, startTime, endTime });
      setItems((prev) => [...prev, created]);
      setStartText("");
      setEndText("");
    } catch {
      setError("추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row gap="s" className="items-center pb-spacing-5">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="header-large">불가능 시간</Text>
      </Row>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: getSpacing("spacing-9") }}>
        <Stack gap="xl" width="full">
          <Stack gap="m" width="full">
            <Text variant="base-medium" weight="medium">요일</Text>
            <Row gap="s" className="flex-wrap">
              {DAY_OF_WEEK_LABELS.map((label, i) => {
                const value = i + 1;
                const isSelected = dayOfWeek === value;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setDayOfWeek(value)}
                    className="px-spacing-5 py-spacing-3 rounded-radius-full border-2"
                    style={{
                      borderColor: isSelected ? "#F6482D" : "#525866",
                      backgroundColor: isSelected ? "rgba(246,72,45,0.15)" : "transparent",
                    }}
                  >
                    <Text weight="medium" style={{ color: isSelected ? "#F6482D" : "#8A919E" }}>{label}</Text>
                  </Pressable>
                );
              })}
            </Row>
          </Stack>

          <Row gap="m" width="full">
            <View className="flex-1">
              <Input label="시작 시간" placeholder="HH:MM" value={startText} onChangeText={setStartText} />
            </View>
            <View className="flex-1">
              <Input label="종료 시간" placeholder="HH:MM" value={endText} onChangeText={setEndText} />
            </View>
          </Row>

          {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}

          <Button variant={submitting ? "disabled" : "primary"} onPress={handleAdd}>추가</Button>
        </Stack>

        <Stack gap="s" width="full" className="pt-spacing-9">
          {items.map((item) => (
            <UnavailableTimeRow key={item.id} item={item} />
          ))}
        </Stack>
      </ScrollView>
    </View>
  );
}
