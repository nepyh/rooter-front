import { Pressable } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import type { TextbookWithSubject } from "../../home/Home/TextbookPicker";

// ================================
// Types
// ================================

type FieldState = "picked" | "empty";

// ================================
// Styles
// ================================

const valueColors: Record<FieldState, "primary" | "disabled"> = {
  "picked": "primary",
  "empty": "disabled",
};

// ================================
// Components
// ================================

interface Props {
  textbook: TextbookWithSubject | null;
  onPress: () => void;
  onClear: () => void;
  className?: string;
}

/**
 * 할 일 추가에서 과목(교과서)을 고르는 칸. 입력칸과 같은 모양이고, 누르면 교과서 선택 화면을 엶
 * 고른 교과서는 "과목 · 교과서 이름" 으로 보여주고, 오른쪽 지우기 버튼으로 다시 비울 수 있음 (과목은 고르지 않아도 됨)
 * @param textbook 고른 교과서, 안 골랐으면 null
 * @param onPress 칸을 눌렀을 때 호출 (교과서 선택 화면 열기)
 * @param onClear 지우기 버튼을 눌렀을 때 호출
 */
export function TodoTextbookField({ textbook, onPress, onClear, className = "" }: Props) {
  const state: FieldState = textbook ? "picked" : "empty";
  const label = textbook
    ? `${textbook.subjectName} · ${textbook.title.replace(/\s*\([^)]+\)\s*$/, "")}`
    : "과목을 골라주세요";

  return (
    <Pressable onPress={onPress} className={`p-spacing-6 w-full gap-spacing-1 rounded-radius-4 bg-neutral-700 border-2 border-transparent ${className}`}>
      <Text variant="base-caption" weight="medium" color="secondary">과목 (선택)</Text>
      <Row gap="s" className="items-center">
        <Stack className="flex-1">
          <Text variant="base-large" color={valueColors[state]} numberOfLines={1}>{label}</Text>
        </Stack>
        {textbook ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Icon name="clear" size={22} color={color.neutral["500"]} />
          </Pressable>
        ) : (
          <Icon name="chevronRight" size={22} color={color.neutral["500"]} />
        )}
      </Row>
    </Pressable>
  );
}
