import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Switch } from "../../ui/Switch";

// ================================
// Components
// ================================

interface Props {
  value: boolean;
  onToggle: () => void;
}

/**
 * 대표 플랜으로 설정하는 스위치 카드. 대표 플랜의 D-Day 가 홈 화면에 나타남
 * @param value 이 플랜이 대표 플랜인지
 * @param onToggle 스위치를 눌렀을 때 호출
 */
export function RepresentativePlanToggle({ value, onToggle }: Props) {
  return (
    <Row width="full" gap="l" className="items-center bg-neutral-700 p-spacing-6 rounded-radius-4">
      <Stack gap="s" className="flex-1">
        <Text variant="base-large" weight="medium">대표 플랜으로 설정하기</Text>
        <Text variant="base-medium" color="secondary">대표 플랜의 디데이가 홈 화면에서 나타납니다.</Text>
      </Stack>
      <Switch value={value} onToggle={onToggle} />
    </Row>
  );
}
