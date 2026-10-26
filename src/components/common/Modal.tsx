import { Pressable, Modal as RNModal, ModalProps } from "react-native";
import { Row, Stack } from "../layout";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { getRadius } from "@/utils/common/token";

const BUTTON_STYLE = { flex: 1, height: 52, borderRadius: getRadius("radius-4"), paddingTop: 0, paddingBottom: 0 };

interface Props extends Omit<ModalProps, "children"> {
  title: string;
  description?: string;
  cancelText?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function Modal({ title, description, cancelText = "취소", confirmText, onCancel, onConfirm, ...props }: Props) {
  return (
    <RNModal transparent statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel} {...props}>
      <Pressable className="flex-1 bg-neutral-1000/40 items-center justify-center px-spacing-5" onPress={onCancel}>
        <Pressable style={{ width: "100%", maxWidth: 354 }}>
          <Stack gap="xxl" width="full" className="bg-neutral-800 p-spacing-6 rounded-radius-5">
            <Stack gap="s" width="full">
              <Text variant="header-medium">{title}</Text>
              {!!description && <Text variant="base-medium" color="secondary">{description}</Text>}
            </Stack>
            <Row gap="m" width="full">
              <Button variant="disabled" disabled={false} width="auto" style={BUTTON_STYLE} onPress={onCancel}>
                {cancelText}
              </Button>
              <Button variant="primary" width="auto" style={BUTTON_STYLE} onPress={onConfirm}>
                {confirmText}
              </Button>
            </Row>
          </Stack>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
