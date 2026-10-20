import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  className?: string;
}

/**
 * 마스코트와 "Rooter" 글자로 된 로고
 * @param className 바깥 Stack 에 덧붙일 클래스
 */
export function RooterLogo({ className = "" }: Props) {
  return (
    <Stack gap="l" className={`items-center justify-center ${className}`}>
      <Icon name="mascot" size={140} color={color.primary["500"]} />
      <Text weight="semibold" style={{ color: color.primary["500"], fontSize: 50, lineHeight: 60, fontFamily: "Jalnan2" }}>
        Rooter
      </Text>
    </Stack>
  );
}
