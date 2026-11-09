import { Modal, Pressable } from "react-native";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { getRadius } from "@/utils/common/token";

const button_style = { width: 150, height: 52, borderRadius: getRadius("radius-4"), paddingTop: 0, paddingBottom: 0 };

interface Props {
  title: string;
  description?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 되돌릴 수 없는 동작을 한 번 더 묻는 확인창
 * @param title 제목
 * @param description 설명
 * @param confirmText 확인 버튼 문구
 * @param onCancel 취소하거나 바깥을 눌렀을 때 호출
 * @param onConfirm 확인 버튼을 눌렀을 때 호출
 */
export function ConfirmDeleteModal({ title, description, confirmText = "삭제", onCancel, onConfirm }: Props) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-neutral-1000/40 items-center justify-center px-spacing-5" onPress={onCancel}>
        <Pressable style={{ width: "100%", maxWidth: 354 }}>
          <Stack gap="xxl" width="full" className="bg-neutral-800 p-spacing-6 rounded-radius-5">
            <Stack gap="s" width="full">
              <Text variant="header-medium">{title}</Text>
              <Text variant="base-medium" color="secondary">{description}</Text>
            </Stack>
            <Row gap="m" width="full">
              <Button variant="disabled" disabled={false} width="auto" style={button_style} onPress={onCancel}>
                취소
              </Button>
              <Button variant="primary" width="auto" style={button_style} onPress={onConfirm}>
                {confirmText}
              </Button>
            </Row>
          </Stack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
