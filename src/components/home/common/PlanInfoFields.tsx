import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Input } from "../../ui/Input";

// ================================
// Constants
// ================================

const PLAN_TITLE_MAX_LENGTH = 100;
const PLAN_DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_INPUT_HEIGHT = 80;

// ================================
// Components
// ================================

interface Props {
  title: string;
  description: string;
  onChangeTitle: (title: string) => void;
  onChangeDescription: (description: string) => void;
}

/**
 * 플랜 이름·설명 입력 칸. 감싸는 쪽의 간격을 따르도록 두 칸을 묶지 않고 나란히 돌려줌
 * @param title 플랜 이름
 * @param description 플랜 설명
 * @param onChangeTitle 이름을 바꿀 때 호출
 * @param onChangeDescription 설명을 바꿀 때 호출
 */
export function PlanInfoFields({ title, description, onChangeTitle, onChangeDescription }: Props) {
  return (
    <>
      <Stack gap="s" width="full">
        <Text variant="base-medium">플랜 이름</Text>
        <Input value={title} onChangeText={onChangeTitle} placeholder="예시: 중간고사" maxLength={PLAN_TITLE_MAX_LENGTH} />
      </Stack>
      <Stack gap="s" width="full">
        <Text variant="base-medium">플랜 설명</Text>
        <Input
          value={description}
          onChangeText={onChangeDescription}
          placeholder="예시: 2026학년도 2회 중간고사"
          maxLength={PLAN_DESCRIPTION_MAX_LENGTH}
          multiline
          textAlignVertical="top"
          style={{ height: DESCRIPTION_INPUT_HEIGHT }}
        />
      </Stack>
    </>
  );
}
