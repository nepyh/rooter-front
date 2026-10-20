import { Stack } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props {
  title: string;
  description: string;
  className?: string;
}

/**
 * 플랜 만들기 화면들의 큰 제목과 설명
 * @param title 제목
 * @param description 제목 아래 설명 문구
 * @param className 아래 여백·구분선 등을 덧붙일 클래스
 */
export function PageTitle({ title, description, className = "" }: Props) {
  return (
    <Stack gap="s" width="full" className={className}>
      <Text variant="title-medium" weight="semibold">{title}</Text>
      <Text variant="base-medium" color="secondary">{description}</Text>
    </Stack>
  );
}
