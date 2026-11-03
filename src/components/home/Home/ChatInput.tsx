import type { Ref } from "react";
import { Pressable, TextInput, TextInputProps } from "react-native";
import { Row } from "../../layout";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type SendState = "active" | "inactive";

// ================================
// Constants
// ================================

const INPUT_RADIUS = 28;
const INPUT_GAP = 10;
const INPUT_LINE_HEIGHT = 24;
const INPUT_MAX_HEIGHT = 124;
const SEND_BUTTON_SIZE = 40;

// ================================
// Styles
// ================================

const sendStateStyles: Record<SendState, string> = {
  "active": "bg-primary-500",
  "inactive": "bg-neutral-600",
};

// ================================
// Components
// ================================

interface Props extends TextInputProps {
  ref?: Ref<TextInput>;
  onSend: () => void;
  sending?: boolean;
}

/**
 * AI 채팅 입력창. 글자가 있으면 전송 버튼이 활성화됨
 * @param onSend 전송 버튼이나 키보드 전송을 눌렀을 때 호출
 * @param sending 답변을 기다리는 중이면 true (전송 버튼 비활성화)
 */
export function ChatInput({ ref, value, onSend, sending = false, ...props }: Props) {
  const canSend = !!value?.trim() && !sending;

  return (
    <Row
      width="full"
      className="items-end bg-neutral-700 border border-neutral-600 pl-spacing-6 pr-spacing-3 py-spacing-3"
      style={{ borderRadius: INPUT_RADIUS, gap: INPUT_GAP }}
    >
      <TextInput
        ref={ref}
        value={value}
        placeholder="루티에게 질문하기..."
        placeholderTextColor={color.text.disabled}
        multiline
        submitBehavior="submit"
        onSubmitEditing={onSend}
        returnKeyType="send"
        className="flex-1 text-lg font-medium text-text-primary py-spacing-3"
        style={{ lineHeight: INPUT_LINE_HEIGHT, maxHeight: INPUT_MAX_HEIGHT }}
        {...props}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityLabel="보내기"
        className={`items-center justify-center rounded-radius-full ${sendStateStyles[canSend ? "active" : "inactive"]}`}
        style={{ width: SEND_BUTTON_SIZE, height: SEND_BUTTON_SIZE }}
      >
        <Icon name="arrowUp" size={24} color={color.neutral["0"]} />
      </Pressable>
    </Row>
  );
}
