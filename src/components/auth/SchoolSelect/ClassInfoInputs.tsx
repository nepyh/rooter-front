import { View } from "react-native";
import { Row } from "../../layout";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { GRADE_OPTIONS } from "@/constants/school";
import { isValidClassNumber, toClassNumberInput } from "@/utils/auth/classNumber";

// ================================
// Constants
// ================================

const CLASS_NUMBER_ERROR = "반은 1 이상 숫자로 입력해주세요.";

// ================================
// Components
// ================================

interface Props {
  grade: string;
  classNum: string;
  onChangeGrade: (grade: string) => void;
  onChangeClassNum: (text: string) => void;
}

/**
 * 학년 선택칸과 반 입력칸을 가로로 나란히 배치. 학년은 1~3학년 중에서만 고름
 * 반은 숫자만 받고(띄어쓰기 등은 지움), 0 처럼 1 보다 작으면 칸 아래에 안내를 보여줌
 * @param grade 고른 학년 ("1"~"3"), 안 골랐으면 빈 문자열
 * @param classNum 입력된 반
 * @param onChangeGrade 학년을 골랐을 때 호출
 * @param onChangeClassNum 반이 바뀔 때 호출
 */
export function ClassInfoInputs({
  grade,
  classNum,
  onChangeGrade,
  onChangeClassNum,
}: Props) {
  return (
    <Row gap="m" width="full">
      <View className="flex-1">
        <Select
          label="학년"
          sheetTitle="학년을 선택해주세요"
          value={grade}
          options={GRADE_OPTIONS}
          onChange={onChangeGrade}
        />
      </View>
      <View className="flex-1">
        <Input
          value={classNum}
          onChangeText={(text) => onChangeClassNum(toClassNumberInput(text))}
          errorMessage={classNum && !isValidClassNumber(classNum) ? CLASS_NUMBER_ERROR : undefined}
          label="반"
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>
    </Row>
  );
}
