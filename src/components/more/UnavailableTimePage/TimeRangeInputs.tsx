import { View } from "react-native";
import { Row } from "../../layout";
import { Input } from "../../ui/Input";

// ================================
// Components
// ================================

interface Props {
  start: string;
  end: string;
  onChangeStart: (text: string) => void;
  onChangeEnd: (text: string) => void;
}

/**
 * 시작·종료 시간(HH:MM) 입력칸 두 개를 가로로 나란히 배치
 * @param start 입력된 시작 시간
 * @param end 입력된 종료 시간
 * @param onChangeStart 시작 시간이 바뀔 때 호출
 * @param onChangeEnd 종료 시간이 바뀔 때 호출
 */
export function TimeRangeInputs({ start, end, onChangeStart, onChangeEnd }: Props) {
  return (
    <Row gap="m" width="full">
      <View className="flex-1">
        <Input label="시작 시간" placeholder="HH:MM" value={start} onChangeText={onChangeStart} />
      </View>
      <View className="flex-1">
        <Input label="종료 시간" placeholder="HH:MM" value={end} onChangeText={onChangeEnd} />
      </View>
    </Row>
  );
}
