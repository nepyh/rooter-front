import { View } from "react-native";
import { Row } from "../../layout";
import { Input } from "../../ui/Input";

// ================================
// Components
// ================================

interface Props {
  grade: string;
  classNum: string;
  onChangeGrade: (text: string) => void;
  onChangeClassNum: (text: string) => void;
}

/**
 * 학년·반 입력칸 두 개를 가로로 나란히 배치
 * @param grade 입력된 학년
 * @param classNum 입력된 반
 * @param onChangeGrade 학년이 바뀔 때 호출
 * @param onChangeClassNum 반이 바뀔 때 호출
 */
export function ClassInfoInputs({ grade, classNum, onChangeGrade, onChangeClassNum }: Props) {
  return (
    <Row gap="m" width="full">
      <View className="flex-1">
        <Input value={grade} onChangeText={onChangeGrade} label="학년" keyboardType="number-pad" maxLength={2} />
      </View>
      <View className="flex-1">
        <Input value={classNum} onChangeText={onChangeClassNum} label="반" keyboardType="number-pad" maxLength={2} />
      </View>
    </Row>
  );
}
