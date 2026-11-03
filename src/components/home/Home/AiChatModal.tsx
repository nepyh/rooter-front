import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Text } from "../../ui/Text";
import { VerticalGradient } from "../common";
import { ChatHeader } from "./ChatHeader";
import { ChatSessionList } from "./ChatSessionList";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatInput } from "./ChatInput";
import { getChatHistory, sendChatMessage } from "@/api/home/Home/chat";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { parseServerDateTime } from "@/utils/common/date";
import type { ChatFeedback, ChatMessage, ChatSession } from "@/utils/home/chat";

// ================================
// Types
// ================================

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
const HEADER_HEIGHT = 44;

const NO_PLAN_MESSAGE = "오늘 계획이 있어야 일정을 조정할 수 있어요. 먼저 할 일을 추가해주세요.";
const ERROR_MESSAGE = "답변을 받지 못했어요. 잠시 후 다시 시도해주세요.";

const GRADIENT_STOPS = [
  { offset: 0, color: color.background.primary },
  { offset: 0.5, color: color.background.primary },
  { offset: 1, color: color.chat["gradient-bottom"] },
];

const HEADER_FADE_HEIGHT = getSpacing("spacing-6");
const HEADER_FADE_STOPS = [
  { offset: 0, color: color.background.primary },
  { offset: 1, color: color.background.primary, opacity: 0 },
];

// ================================
// Functions
// ================================

const createMessage = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: `${Date.now()}-${role}`,
  role,
  text,
  createdAt: new Date(),
  feedback: null,
});

// ================================
// Components
// ================================

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const currentSession = sessions.find((session) => session.id === currentId) ?? null;
  const messages = currentSession?.messages ?? [];

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
    setSessions([]);
    setCurrentId(null);
    setShowList(false);
    setInput("");
    if (!dailyPlanId) return;
    getChatHistory(dailyPlanId)
      .then((turns) => {
        if (turns.length === 0) return;
        const history: ChatMessage[] = turns.map((turn, i) => ({
          id: `${turn.createdAt}-${i}`,
          role: turn.role.toLowerCase() === "user" ? "user" : "assistant",
          text: turn.content,
          createdAt: parseServerDateTime(turn.createdAt),
          feedback: null,
        }));
        const session: ChatSession = {
          id: `history-${dailyPlanId}`,
          title: history.find((message) => message.role === "user")?.text ?? null,
          updatedAt: history[history.length - 1].createdAt,
          messages: history,
        };
        setSessions([session]);
        setCurrentId(session.id);
      })
      .catch(() => setSessions([]));
  }, [visible, dailyPlanId]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const appendMessage = (sessionId: string, message: ChatMessage) => {
    setSessions((prev) => {
      const target = prev.find((session) => session.id === sessionId) ?? { id: sessionId, title: message.text, updatedAt: message.createdAt, messages: [] };
      const updated = { ...target, updatedAt: message.createdAt, messages: [...target.messages, message] };
      return [updated, ...prev.filter((session) => session.id !== sessionId)];
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const sessionId = currentId ?? `local-${Date.now()}`;
    setCurrentId(sessionId);
    appendMessage(sessionId, createMessage("user", text));
    setInput("");

    if (!dailyPlanId) {
      appendMessage(sessionId, createMessage("assistant", NO_PLAN_MESSAGE));
      return;
    }

    setSending(true);
    try {
      const result = await sendChatMessage(dailyPlanId, text);
      appendMessage(sessionId, createMessage("assistant", result.reply));
      if (result.planChanged || (result.movedTasks?.length ?? 0) > 0) onPlanChanged?.();
    } catch {
      appendMessage(sessionId, createMessage("assistant", ERROR_MESSAGE));
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: ChatFeedback) => {
    setSessions((prev) => prev.map((session) => session.id !== currentId ? session : {
      ...session,
      messages: session.messages.map((message) => message.id !== messageId ? message : {
        ...message,
        feedback: message.feedback === feedback ? null : feedback,
      }),
    }));
  };

  const handleNewChat = () => {
    if (sending) return;
    setCurrentId(null);
    setInput("");
    setShowList(false);
  };

  const handleSelectSession = (sessionId: string) => {
    if (sending) return;
    setCurrentId(sessionId);
    setShowList(false);
  };

  const handleDeleteAll = () => {
    if (sending) return;
    setSessions([]);
    setCurrentId(null);
    setShowList(false);
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
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
            <View className="flex-1 rounded-t-radius-6 overflow-hidden">
              <VerticalGradient className="absolute inset-spacing-0" stops={GRADIENT_STOPS} />
              <View className="flex-1 items-center pt-spacing-3 pb-spacing-11 px-spacing-7" style={{ gap: getSpacing("spacing-7") }}>
                <View className="bg-neutral-600 rounded-radius-full" style={{ width: 104, height: 4 }} />

                <View className="flex-1 w-full">
                  <ChatHeader
                    title={currentSession?.title ?? null}
                    onPressList={() => setShowList((prev) => !prev)}
                    onPressNewChat={handleNewChat}
                  />

                  {messages.length === 0 && !sending ? (
                    <View className="flex-1 justify-end pb-spacing-11">
                      <ChatSuggestions onSelect={handleSelectSuggestion} />
                    </View>
                  ) : (
                    <View className="flex-1 w-full" style={{ marginTop: -HEADER_FADE_HEIGHT }}>
                      <ScrollView
                        ref={scrollRef}
                        className="flex-1 w-full"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingTop: HEADER_FADE_HEIGHT + getSpacing("spacing-3"), paddingBottom: getSpacing("spacing-11"), gap: getSpacing("spacing-11") }}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                      >
                        {messages.map((message) => (
                          <ChatMessageItem
                            key={message.id}
                            message={message}
                            onFeedback={(feedback) => handleFeedback(message.id, feedback)}
                          />
                        ))}
                        {sending && (
                          <Text variant="base-large" color="disabled" style={{ lineHeight: 24 }}>답변 생성 중...</Text>
                        )}
                      </ScrollView>
                      <VerticalGradient
                        className="absolute top-spacing-0 left-spacing-0 right-spacing-0"
                        style={{ height: HEADER_FADE_HEIGHT }}
                        stops={HEADER_FADE_STOPS}
                      />
                    </View>
                  )}

                  <ChatInput
                    ref={inputRef}
                    value={input}
                    onChangeText={setInput}
                    onSend={handleSend}
                    sending={sending}
                  />

                  {showList && (
                    <>
                      <Pressable className="absolute inset-spacing-0" onPress={() => setShowList(false)} />
                      <ChatSessionList
                        className="absolute left-spacing-0 right-spacing-0"
                        style={{ top: HEADER_HEIGHT + getSpacing("spacing-4") }}
                        sessions={sessions}
                        currentId={currentId}
                        now={new Date()}
                        onSelect={handleSelectSession}
                        onDeleteAll={handleDeleteAll}
                      />
                    </>
                  )}
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
