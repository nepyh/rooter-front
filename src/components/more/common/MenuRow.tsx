import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type Arrow = "muted" | "default" | "none";

// ================================
// Styles
// ================================

const arrowColors: Record<Exclude<Arrow, "none">, string | undefined> = {
  "muted": color.neutral["400"],
  "default": undefined,
};

// ================================
// Components
// ================================

interface Props {
  label: string;
  icon?: IconName;
  arrow?: Arrow;
  onPress?: () => void;
}

/**
 * 메뉴 한 줄. 왼쪽에 아이콘(선택)과 글자, 오른쪽 끝에 화살표
 * @param label 메뉴 글자
 * @param icon 글자 왼쪽 아이콘
 * @param arrow 오른쪽 화살표 (muted: 흐린 회색, default: 기본색, none: 없음)
 * @param onPress 눌렀을 때 호출
 */
export function MenuRow({ label, icon, arrow = "default", onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between p-spacing-4 rounded-radius-3 w-full">
      <Row gap="m" className="flex-1 items-center">
        {icon && <Icon name={icon} size={20} />}
        <Text variant="base-medium" weight="medium" className="text-text-primary">{label}</Text>
      </Row>
      {arrow !== "none" && <Icon name="chevronRight" size={24} color={arrowColors[arrow]} />}
    </Pressable>
  );
}
