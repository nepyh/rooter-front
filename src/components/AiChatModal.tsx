import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Stack, Row } from "@/components/layout";
import { Text } from "@/components/ui";
import { Icon } from "@/assets";
import { getChatHistory, sendChatMessage } from "@/api/chat";

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

// AddPlanBoardModal과 동일하게, 배경(Pressable)에 명확한 높이가 없어 퍼센트 높이가 먹지 않으므로
// 화면 실측 높이로 고정 픽셀 값을 계산합니다.
const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.9);

const NO_PLAN_MESSAGE = "오늘 계획이 있어야 일정을 조정할 수 있어요. 먼저 할 일을 추가해주세요.";
const ERROR_MESSAGE = "답변을 받지 못했어요. 잠시 후 다시 시도해주세요.";

// ================================
// Components
// ================================

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <Row align={isUser ? "end" : "start"} width="full">
      <View
        className={`px-xl py-l rounded-full ${isUser ? "bg-primary-500" : "bg-neutral-700"}`}
        style={{ maxWidth: "80%" }}
      >
        <Text variant="base-large" weight="medium" className="text-white">{message.text}</Text>
      </View>
    </Row>
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

  // 모달 열 때마다 서버 대화 이력으로 초기화
  useEffect(() => {
    if (!visible) return;
    setMessages([]);
    setInput("");
    if (!dailyPlanId) return;
    getChatHistory(dailyPlanId)
      .then((turns) => setMessages(turns.map((turn, i) => ({
        id: `${turn.createdAt}-${i}`,
        role: turn.role.toLowerCase() === "user" ? "user" : "assistant",
        text: turn.content,
      }))))
      .catch(() => setMessages([]));
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
      if (result.planChanged) onPlanChanged?.();
    } catch {
      addAssistantMessage(ERROR_MESSAGE);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={[{ height: SHEET_HEIGHT, width: "100%" }, sheetStyle]}>
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <Stack gap="xl" width="full" align="center" className="bg-background-primary pt-s pb-xxl px-xl rounded-t-[32px] flex-1">
                <View className="self-center bg-neutral-600 rounded-full" style={{ width: 104, height: 4 }} />

                <ScrollView
                  ref={scrollRef}
                  className="flex-1 w-full"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", gap: 20, paddingBottom: 20 }}
                  onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                >
                  {messages.map((message) => (
                    <Bubble key={message.id} message={message} />
                  ))}
                  {sending && <Bubble message={{ id: "typing", role: "assistant", text: "..." }} />}
                </ScrollView>

                <Row
                  width="full"
                  align="between"
                  className="items-center bg-neutral-700 pl-xl pr-xs py-xs rounded-full"
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="채팅..."
                    placeholderTextColor="#8B919E"
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    className="flex-1 text-lg text-white"
                  />
                  <Pressable
                    onPress={handleSend}
                    disabled={!input.trim() || sending}
                    className={`items-center justify-center rounded-full ${input.trim() && !sending ? "bg-primary-500" : "bg-neutral-600"}`}
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon name="arrowUp" size={24} color="#FFFFFF" />
                  </Pressable>
                </Row>
              </Stack>
            </KeyboardAvoidingView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
