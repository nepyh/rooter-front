import { Pressable, View, ViewProps } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon, type IconName } from "@/assets";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { formatChatTime, type ChatFeedback, type ChatMessage } from "@/utils/home/chat";

// ================================
// Types
// ================================

type ActionState = "active" | "inactive";

// ================================
// Constants
// ================================

const MESSAGE_LINE_HEIGHT = 24;
const ACTION_ICON_SIZE = 24;

const FEEDBACK_ACTIONS: { feedback: ChatFeedback; icon: IconName; label: string }[] = [
  { feedback: "LIKE", icon: "thumbUp", label: "답변 좋음" },
  { feedback: "DISLIKE", icon: "thumbDown", label: "답변 싫음" },
];

// ================================
// Styles
// ================================

const actionColors: Record<ActionState, string> = {
  "active": color.primary["500"],
  "inactive": color.neutral["500"],
};

// ================================
// Components
// ================================

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <View className="w-full items-end" style={{ gap: getSpacing("spacing-3") }}>
      <View className="bg-neutral-700 p-spacing-5 rounded-tl-radius-4 rounded-bl-radius-4 rounded-br-radius-4" style={{ maxWidth: "90%" }}>
        <Text variant="base-large" className="text-right" style={{ lineHeight: MESSAGE_LINE_HEIGHT }} selectable>
          {message.text}
        </Text>
      </View>
      <Text variant="base-small" color="disabled" className="pr-spacing-5">
        {formatChatTime(message.createdAt)}
      </Text>
    </View>
  );
}

interface AssistantMessageProps {
  message: ChatMessage;
  onCopy?: () => void;
  onFeedback?: (feedback: ChatFeedback) => void;
}

function AssistantMessage({ message, onCopy, onFeedback }: AssistantMessageProps) {
  return (
    <View className="w-full" style={{ gap: getSpacing("spacing-6") }}>
      <Text variant="base-large" style={{ lineHeight: MESSAGE_LINE_HEIGHT }} selectable>
        {message.text}
      </Text>
      <Row gap="m" className="items-center">
        <Pressable onPress={onCopy} hitSlop={6} accessibilityLabel="답변 복사">
          <Icon name="copy" size={ACTION_ICON_SIZE} color={actionColors.inactive} />
        </Pressable>
        {FEEDBACK_ACTIONS.map((action) => (
          <Pressable
            key={action.feedback}
            onPress={() => onFeedback?.(action.feedback)}
            hitSlop={6}
            accessibilityLabel={action.label}
            accessibilityState={{ selected: message.feedback === action.feedback }}
          >
            <Icon
              name={action.icon}
              size={ACTION_ICON_SIZE}
              color={actionColors[message.feedback === action.feedback ? "active" : "inactive"]}
            />
          </Pressable>
        ))}
      </Row>
    </View>
  );
}

interface Props extends ViewProps {
  message: ChatMessage;
  onCopy?: () => void;
  onFeedback?: (feedback: ChatFeedback) => void;
}

/**
 * AI 채팅 메시지 한 개. 내 메시지는 오른쪽 말풍선 + 보낸 시각, 챗봇 답변은 본문 + 복사·좋음·싫음 버튼
 * @param message 보여줄 메시지
 * @param onCopy 챗봇 답변의 복사 버튼을 눌렀을 때 호출
 * @param onFeedback 챗봇 답변의 좋음/싫음 버튼을 눌렀을 때 호출
 */
export function ChatMessageItem({ message, onCopy, onFeedback, ...props }: Props) {
  return (
    <View {...props}>
      {message.role === "user" ? (
        <UserMessage message={message} />
      ) : (
        <AssistantMessage message={message} onCopy={onCopy} onFeedback={onFeedback} />
      )}
    </View>
  );
}
