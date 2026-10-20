import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { Stack, Row } from "@/components/layout";
import { Text } from "@/components/ui";
import { Icon } from "@/assets";
import { getChatHistory, sendChatMessage } from "@/api/home/Home/chat";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Types
// ================================

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface Props {
  visible: boolean;
  dailyPlanId: number | null;
  onClose: () => void;
  onPlanChanged?: () => void;
}

// ================================
// Constants
// ================================

const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.9);

const GREETING: Message = { id: "greeting", role: "assistant", text: "일정 변경이 필요하거나 궁금한 점이 있다면\n저에게 물어봐주세요." };
const NO_PLAN_MESSAGE = "오늘 계획이 있어야 일정을 조정할 수 있어요. 먼저 할 일을 추가해주세요.";
const ERROR_MESSAGE = "답변을 받지 못했어요. 잠시 후 다시 시도해주세요.";

// ================================
// Components
// ================================

const bubbleGap = (messages: Message[], index: number) => {
  if (index === 0) return 0;
  return messages[index - 1].role === messages[index].role ? 8 : 20;
};

const splitSentences = (text: string) =>
  text
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const BUBBLE_LINE_HEIGHT = 28;

function Bubble({ message, marginTop = 0 }: { message: Message; marginTop?: number }) {
  const isUser = message.role === "user";
  const lines = isUser ? [message.text] : splitSentences(message.text);
  return (
    <Row align={isUser ? "end" : "start"} width="full" style={{ marginTop }}>
      <View
        className={`px-spacing-5 py-spacing-4 rounded-radius-5 ${isUser ? "bg-primary-500" : "bg-neutral-700"}`}
        style={{ maxWidth: "85%", gap: getSpacing("spacing-2") }}
      >
        {lines.map((line, i) => (
          <Text key={i} variant="base-large" className="text-text-primary" style={{ lineHeight: BUBBLE_LINE_HEIGHT }}>{line}</Text>
        ))}
      </View>
    </Row>
  );
}

const TYPING_DOT_DELAY_MS = 160;
const SLOW_REPLY_MS = 3_000;

function TypingDot({ index }: { index: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * TYPING_DOT_DELAY_MS,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }), withTiming(0, { duration: 240 })), -1),
    );
  }, [index, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [{ translateY: -4 * progress.value }],
  }));
  return <Animated.View className="w-spacing-3 h-spacing-3 rounded-radius-full" style={[{ backgroundColor: color.neutral["400"] }, style]} />;
}

function TypingBubble({ marginTop }: { marginTop: number }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_REPLY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Stack gap="xs" width="full" style={{ marginTop }}>
      <Row align="start" width="full">
        <Row className="px-spacing-5 rounded-radius-5 bg-neutral-700 items-center" style={{ height: 44, gap: getSpacing("spacing-3") }}>
          {[0, 1, 2].map((i) => <TypingDot key={i} index={i} />)}
        </Row>
      </Row>
      {slow && <Text variant="base-small" color="disabled" className="pl-spacing-3">답변을 만들고 있어요. 조금만 기다려주세요</Text>}
    </Stack>
  );
}

/**
 * AI 채팅 모달
 * @param visible 모달 표시 여부를 설정합니다.
 * @param dailyPlanId 대화할 일일 계획 ID를 설정합니다.
 * @param onClose 모달을 닫을 때 실행할 행동을 입력합니다.
 * @param onPlanChanged AI가 계획을 바꿨을 때 실행할 행동을 입력합니다.
 */
export function AiChatModal({ visible, dailyPlanId, onClose, onPlanChanged }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const [isRendered, setIsRendered] = useState(visible);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [inputHeight, setInputHeight] = useState(52);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 400, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setIsRendered)(false);
      });
    }
  }, [visible, translateY]);

  useEffect(() => {
    if (!visible) return;
    setMessages([GREETING]);
    setInput("");
    if (!dailyPlanId) return;
    getChatHistory(dailyPlanId)
      .then((turns) => setMessages([GREETING, ...turns.map((turn, i): Message => ({
        id: `${turn.createdAt}-${i}`,
        role: turn.role.toLowerCase() === "user" ? "user" : "assistant",
        text: turn.content,
      }))]))
      .catch(() => setMessages([GREETING]));
  }, [visible, dailyPlanId]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const addAssistantMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", text }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (!dailyPlanId) {
      addAssistantMessage(NO_PLAN_MESSAGE);
      return;
    }

    setSending(true);
    try {
      const result = await sendChatMessage(dailyPlanId, text);
      addAssistantMessage(result.reply);
      if (result.planChanged || (result.movedTasks?.length ?? 0) > 0) onPlanChanged?.();
    } catch {
      addAssistantMessage(ERROR_MESSAGE);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-spacing-0 bg-neutral-1000/40" onPress={onClose} />
        <Animated.View style={[{ height: SHEET_HEIGHT, width: "100%" }, sheetStyle]}>
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <Stack gap="xl" width="full" align="center" className="bg-background-primary pt-spacing-3 pb-spacing-9 px-spacing-7 rounded-t-radius-6 flex-1">
                <View className="self-center bg-neutral-600 rounded-radius-full" style={{ width: 104, height: 4 }} />

                <ScrollView
                  ref={scrollRef}
                  className="flex-1 w-full"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", paddingBottom: inputHeight + getSpacing("spacing-6") }}
                  onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                >
                  {messages.map((message, i) => (
                    <Bubble key={message.id} message={message} marginTop={bubbleGap(messages, i)} />
                  ))}
                  {sending && (
                    <TypingBubble marginTop={messages.at(-1)?.role === "assistant" ? 8 : 20} />
                  )}
                </ScrollView>

                <Row
                  align="between"
                  className="absolute left-spacing-7 right-spacing-7 bottom-spacing-9 z-10 items-end bg-neutral-700 pl-spacing-6 pr-spacing-2 py-spacing-2 rounded-radius-full"
                  onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="채팅..."
                    placeholderTextColor="#8B919E"
                    multiline
                    submitBehavior="submit"
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    className="flex-1 text-base font-medium text-text-primary py-spacing-4 pr-spacing-3"
                    style={{ maxHeight: 124 }}
                  />
                  <Pressable
                    onPress={handleSend}
                    disabled={!input.trim() || sending}
                    className={`items-center justify-center rounded-radius-full ${input.trim() && !sending ? "bg-primary-500" : "bg-neutral-600"}`}
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon name="arrowUp" size={24} color="#FFFFFF" />
                  </Pressable>
                </Row>
              </Stack>
            </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
