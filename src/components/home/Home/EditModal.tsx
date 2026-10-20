import { useState } from "react";
import { Modal, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Text } from "../../ui/Text";
import { color } from "@/constants/token/color";
import { WINDOW_START_MIN, parseClock, type Plan } from "@/utils/home/timeline";
import { DAY_MIN } from "@/utils/common/time";

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  onSave: (title: string, start: number, duration: number) => void;
  onClose: () => void;
}

/**
 * 일정 제목·시작·종료 시간을 고치는 아래쪽 모달
 * @param plan 고칠 계획
 * @param onSave 저장을 눌렀을 때 호출 (start 는 타임라인 기준 분, duration 은 분)
 * @param onClose 취소하거나 닫을 때 호출
 */
export function EditModal({ plan, onSave, onClose }: Props) {
  const historyLine = plan.lines.find((line) => line.icon === "history");
  const initial = historyLine?.text.match(/^(\d{1,2}:\d{2}) - (\d{1,2}:\d{2})/);

  const [title, setTitle] = useState(plan.title);
  const [startText, setStartText] = useState(initial?.[1] ?? "");
  const [endText, setEndText] = useState(initial?.[2] ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const startMin = parseClock(startText);
    const endMin = parseClock(endText);
    if (!title.trim() || startMin === null || endMin === null) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return;
    }
    const duration = ((endMin - startMin + DAY_MIN) % DAY_MIN) || DAY_MIN;
    const start = (startMin - WINDOW_START_MIN + DAY_MIN) % DAY_MIN;
    onSave(title.trim(), start, duration);
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-neutral-1000/50 justify-end">
        <Stack gap="l" className="bg-background-primary p-spacing-6 rounded-t-radius-4">
          <Text variant="header-medium">일정 수정</Text>
          <Input label="제목" value={title} onChangeText={setTitle} />
          <Row gap="m" width="full">
            <View className="flex-1">
              <Input label="시작 시간" placeholder="HH:MM" value={startText} onChangeText={setStartText} />
            </View>
            <View className="flex-1">
              <Input label="종료 시간" placeholder="HH:MM" value={endText} onChangeText={setEndText} />
            </View>
          </Row>
          {!!error && <Text style={{ color: color.utility["error-primary"] }}>{error}</Text>}
          <Row gap="m" width="full">
            <View className="flex-1">
              <Button variant="disabled" disabled={false} onPress={onClose}> 취소 </Button>
            </View>
            <View className="flex-1">
              <Button variant="primary" onPress={handleSave}> 저장 </Button>
            </View>
          </Row>
        </Stack>
      </View>
    </Modal>
  );
}
