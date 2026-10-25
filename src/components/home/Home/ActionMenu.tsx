import { useState } from "react";
import { View } from "react-native";
import { Row, Stack } from "../../layout";
import { ActionButton } from "./ActionButton";
import { POPOVER_HEIGHT, TIMELINE_LEFT, type Plan } from "@/utils/home/timeline";

// ================================
// Components
// ================================

interface Props {
  plan: Plan;
  onComplete: () => void;
  onFail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * 계획을 꾹 눌렀을 때 뜨는 완료·실패·수정·삭제 말풍선. 위에 공간이 없으면 블록 아래에 띄움
 * @param plan 메뉴를 띄울 계획
 * @param onComplete 완료를 눌렀을 때 호출
 * @param onFail 실패를 눌렀을 때 호출
 * @param onEdit 수정을 눌렀을 때 호출
 * @param onDelete 삭제를 눌렀을 때 호출
 */
export function ActionMenu({ plan, onComplete, onFail, onEdit, onDelete }: Props) {
  const [menuHeight, setMenuHeight] = useState(POPOVER_HEIGHT);
  const showBelow = plan.start < menuHeight + 8;
  const top = showBelow ? plan.start + plan.duration + 8 : plan.start - menuHeight - 8;

  return (
    <View style={{ position: "absolute", top, left: TIMELINE_LEFT }} className="items-center">
      {showBelow && <View className="w-spacing-4 h-spacing-4 -mb-spacing-2 bg-neutral-700 border-l border-t border-neutral-600 rotate-45" />}
      <Stack gap="s" className="bg-neutral-700 border border-neutral-600 rounded-radius-4 p-spacing-2" onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}>
        <Row gap="none" className="items-center">
          <ActionButton icon="check" label="완료" onPress={onComplete} />
          <ActionButton icon="close" label="실패" onPress={onFail} />
          <ActionButton icon="pencil" label="수정" onPress={onEdit} />
          <ActionButton icon="trash" label="삭제" onPress={onDelete} />
        </Row>
      </Stack>
      {!showBelow && <View className="w-spacing-4 h-spacing-4 -mt-spacing-2 bg-neutral-700 border-r border-b border-neutral-600 rotate-45" />}
    </View>
  );
}
