import { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import { Icon } from "@/assets";
import { createPlanTask, getOrCreateCurrentPlanBoard } from "@/api/planBoard";

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

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * 할 일 추가 화면
 */
export default function AddTodo() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [title, setTitle] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !date) return;

    const startTime = parseClock(startText);
    const endTime = parseClock(endText);
    if (!startTime || !endTime) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return;
    }

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    const estimatedMinutes = ((endMin - startMin + 24 * 60) % (24 * 60)) || 24 * 60;

    setError("");
    setSubmitting(true);
    try {
      const board = await getOrCreateCurrentPlanBoard();
      await createPlanTask({
        planBoardId: board.id,
        planDate: date,
        taskName: title.trim(),
        startTime,
        endTime,
        estimatedMinutes,
      });
      router.back();
    } catch {
      setError("할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Row gap="s" className="items-center">
              <Pressable onPress={() => router.back()}>
                <Icon name="chevronLeft" size={28} />
              </Pressable>
              <Text variant="header-large">할 일 추가</Text>
            </Row>
            <Text color="secondary">제목과 시간을 입력해주세요</Text>
          </Stack>

          <Input
            label="할 일 내용"
            value={title}
            onChangeText={setTitle}
            placeholder="할 일을 입력해주세요."
          />

          <Row gap="m" width="full">
            <View className="flex-1">
              <Input label="시작 시간" placeholder="HH:MM" value={startText} onChangeText={setStartText} />
            </View>
            <View className="flex-1">
              <Input label="종료 시간" placeholder="HH:MM" value={endText} onChangeText={setEndText} />
            </View>
          </Row>

          {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}
        </Stack>

        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" disabled={false} onPress={() => router.back()}> 취소 </Button>
          </View>
          <View className="flex-1">
            <Button variant={canSubmit ? "primary" : "disabled"} onPress={handleSubmit}> 추가 </Button>
          </View>
        </Row>
      </Stack>
    </View>
  );
}
