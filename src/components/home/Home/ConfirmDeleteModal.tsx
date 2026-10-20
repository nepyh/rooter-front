import { Modal, Pressable } from "react-native";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { getRadius } from "@/utils/token";

// ================================
// Styles
// ================================

const BUTTON_STYLE = { width: 150, height: 52, borderRadius: getRadius("radius-4"), paddingTop: 0, paddingBottom: 0 };

// ================================
// Components
// ================================

interface Props {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 일정 삭제 확인 모달
 * @param title 모달 제목 (예: 'OO' 일정을 삭제할까요?)
 * @param onCancel 취소하거나 바깥을 눌렀을 때 호출
 * @param onConfirm 삭제를 눌렀을 때 호출
 */
export function ConfirmDeleteModal({ title, onCancel, onConfirm }: Props) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-neutral-1000/40 items-center justify-center px-spacing-5" onPress={onCancel}>
        <Pressable style={{ width: "100%", maxWidth: 354 }}>
          <Stack gap="xxl" width="full" className="bg-neutral-800 p-spacing-6 rounded-radius-5">
            <Stack gap="s" width="full">
              <Text variant="header-medium">{title}</Text>
              <Text variant="base-medium" color="secondary">삭제하고 되돌릴 수 없습니다.</Text>
            </Stack>
            <Row gap="m" width="full">
              <Button variant="disabled" disabled={false} width="auto" style={BUTTON_STYLE} onPress={onCancel}>
                취소
              </Button>
              <Button variant="primary" width="auto" style={BUTTON_STYLE} onPress={onConfirm}>
                삭제
              </Button>
            </Row>
          </Stack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
