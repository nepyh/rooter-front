import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, Button, Text, MorePageHeader, DayOfWeekPicker, TimeRangeInputs, UnavailableTimeRow } from "@/components";
import { useUnavailableTimes } from "@/hooks/more/useUnavailableTimes";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

/**
 * 불가능 시간 화면
 */
export default function UnavailableTimePage() {
  const { items, error, submitting, add } = useUnavailableTimes();
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");

  const handleAdd = async () => {
    if (!(await add(dayOfWeek, startText, endText))) return;
    setStartText("");
    setEndText("");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MorePageHeader title="불가능 시간" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: getSpacing("spacing-9") }}>
        <Stack gap="xl" width="full">
          <Stack gap="m" width="full">
            <Text variant="base-medium" weight="medium">요일</Text>
            <DayOfWeekPicker value={dayOfWeek} onChange={setDayOfWeek} />
          </Stack>

          <TimeRangeInputs start={startText} end={endText} onChangeStart={setStartText} onChangeEnd={setEndText} />

          {!!error && <Text style={{ color: color.utility["error-primary"] }}>{error}</Text>}

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
