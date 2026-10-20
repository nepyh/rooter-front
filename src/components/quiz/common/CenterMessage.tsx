import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  text: string;
}

/**
 * 남은 공간 가운데에 회색 안내 문구 한 줄 (빈 상태·에러 표시용)
 * @param text 보여줄 문구
 */
export function CenterMessage({ text }: Props) {
  return (
    <Stack gap="m" width="full" className="flex-1 items-center justify-center">
      <Text color="secondary">{text}</Text>
    </Stack>
  );
}
