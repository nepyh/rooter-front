import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Text } from "../../ui/Text";
import { Toast } from "../../ui/Toast";
import { VerticalGradient } from "../common";
import { ChatHeader } from "./ChatHeader";
import { ChatSessionList, type ChatSessionListStatus } from "./ChatSessionList";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatInput } from "./ChatInput";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  createChatSession,
  deleteAllChatSessions,
  deleteChatSession,
  getChatSessions,
  getChatSessionTurns,
  sendChatMessage,
  updateChatTurnFeedback,
  type ChatSession,
} from "@/api/home/Home/chat";
import { getChatFeedbackErrorMessage, getChatSendErrorMessage } from "@/api/home/Home/errors";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { parseServerDateTime } from "@/utils/common/date";
import { normalizeLineBreaks, toChatMessage, type ChatFeedback, type ChatMessage } from "@/utils/home/chat";

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
const RESUME_WINDOW_MS = 15 * 60 * 1000;
const MESSAGE_GAP = getSpacing("spacing-11");
const INPUT_BOTTOM = getSpacing("spacing-11");
const INPUT_DEFAULT_HEIGHT = 58;
const INPUT_FADE_HEIGHT = getSpacing("spacing-9");

const NO_PLAN_MESSAGE = "오늘 계획이 있어야 일정을 조정할 수 있어요. 먼저 할 일을 추가해주세요.";
const TURNS_ERROR_MESSAGE = "대화 내용을 불러오지 못했어요";
const CREATE_SESSION_ERROR_MESSAGE = "새 채팅을 만들지 못했어요";
const DELETE_ALL_ERROR_MESSAGE = "채팅 목록을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.";
const UNTITLED_SESSION = "새 대화";

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

const createMessage = (role: ChatMessage["role"], text: string, turnId: number | null = null): ChatMessage => ({
  id: `${Date.now()}-${role}`,
  turnId,
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
  const [listStatus, setListStatus] = useState<ChatSessionListStatus>("loading");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [showList, setShowList] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(INPUT_DEFAULT_HEIGHT);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const turnsRequestRef = useRef(0);
  const feedbackPendingRef = useRef(new Set<number>());
  const emptySessionRef = useRef<number | null>(null);

  const currentSession = sessions.find((session) => session.id === currentSessionId);
  const currentTitle = currentSession?.title ?? draftTitle ?? (messages.length > 0 ? UNTITLED_SESSION : null);
  const inputAreaHeight = inputHeight + INPUT_BOTTOM;
  const inputFadeHeight = inputAreaHeight + INPUT_FADE_HEIGHT;
  const inputFadeStops = [
    { offset: 0, color: color.chat["gradient-bottom"], opacity: 0 },
    { offset: (INPUT_FADE_HEIGHT + inputHeight) / inputFadeHeight, color: color.chat["gradient-bottom"], opacity: 0.9 },
    { offset: 1, color: color.chat["gradient-bottom"], opacity: 1 },
  ];

  const clearError = useCallback(() => setErrorMessage(""), []);

  const loadSessions = useCallback(async () => {
    setListStatus((prev) => (prev === "ready" ? prev : "loading"));
    try {
      const list = await getChatSessions();
      setSessions(list);
      setListStatus("ready");
      return list;
    } catch {
      setListStatus("error");
      return null;
    }
  }, []);

  /**
   * 새 채팅으로 만들었지만 한 번도 보내지 않은 세션을 지움. 다른 채팅으로 옮기거나 화면을 나갈 때 호출
   * @param nextSessionId 이제 열 세션 ID (같은 세션이면 지우지 않음)
   */
  const discardEmptySession = useCallback((nextSessionId: number | null = null) => {
    const sessionId = emptySessionRef.current;
    if (sessionId === null || sessionId === nextSessionId) return;
    emptySessionRef.current = null;
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    deleteChatSession(sessionId).catch(() => {});
  }, []);

  const loadTurns = useCallback((sessionId: number, requestId: number) => {
    setCurrentSessionId(sessionId);
    setDraftTitle(null);
    setMessages([]);
    setLoadingTurns(true);
    getChatSessionTurns(sessionId)
      .then((turns) => {
        if (requestId === turnsRequestRef.current) setMessages(turns.map(toChatMessage));
      })
      .catch(() => {
        if (requestId === turnsRequestRef.current) setErrorMessage(TURNS_ERROR_MESSAGE);
      })
      .finally(() => {
        if (requestId === turnsRequestRef.current) setLoadingTurns(false);
      });
  }, []);

  useEffect(() => () => discardEmptySession(), [discardEmptySession]);

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
    if (!visible) {
      discardEmptySession();
      return;
    }
    const requestId = ++turnsRequestRef.current;
    setSessions([]);
    setListStatus("loading");
    setCurrentSessionId(null);
    setDraftTitle(null);
    setMessages([]);
    setLoadingTurns(false);
    setShowList(false);
    setInput("");
    loadSessions().then((list) => {
      const recent = list?.[0];
      if (!recent || requestId !== turnsRequestRef.current) return;
      if (Date.now() - parseServerDateTime(recent.updatedAt).getTime() > RESUME_WINDOW_MS) return;
      loadTurns(recent.id, requestId);
    });
  }, [visible, loadSessions, loadTurns, discardEmptySession]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || loadingTurns || creatingSession) return;

    const userMessage = createMessage("user", text);
    if (messages.length === 0 && !currentSession?.title) setDraftTitle(text);
    appendMessage(userMessage);
    setInput("");

    if (!dailyPlanId) {
      appendMessage(createMessage("assistant", NO_PLAN_MESSAGE));
      return;
    }

    if (emptySessionRef.current === currentSessionId) emptySessionRef.current = null;
    const requestId = turnsRequestRef.current;
    setSending(true);
    try {
      const sessionId = currentSessionId ?? (await createChatSession()).id;
      const result = await sendChatMessage(dailyPlanId, text, sessionId);
      if (result.planChanged || (result.movedTasks?.length ?? 0) > 0) onPlanChanged?.();
      if (requestId !== turnsRequestRef.current) return;

      setMessages((prev) => [
        ...prev.map((message) => (message.id === userMessage.id ? { ...message, turnId: result.userTurnId } : message)),
        createMessage("assistant", normalizeLineBreaks(result.reply), result.assistantTurnId),
      ]);
      setCurrentSessionId(result.sessionId);
      if (result.sessionTitle) setDraftTitle(null);
      setSessions((prev) => {
        const target = prev.find((session) => session.id === result.sessionId);
        const now = new Date().toISOString();
        const updated: ChatSession = {
          id: result.sessionId,
          title: result.sessionTitle ?? target?.title ?? null,
          createdAt: target?.createdAt ?? now,
          updatedAt: now,
        };
        return [updated, ...prev.filter((session) => session.id !== result.sessionId)];
      });
    } catch (error) {
      if (requestId === turnsRequestRef.current) appendMessage(createMessage("assistant", getChatSendErrorMessage(error)));
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (target: ChatMessage, feedback: ChatFeedback) => {
    const { turnId } = target;
    if (turnId === null || feedbackPendingRef.current.has(turnId)) return;

    const previous = target.feedback;
    const next = previous === feedback ? null : feedback;
    const setTurnFeedback = (value: ChatFeedback | null) =>
      setMessages((prev) => prev.map((message) => (message.turnId === turnId ? { ...message, feedback: value } : message)));

    feedbackPendingRef.current.add(turnId);
    setTurnFeedback(next);
    try {
      const updated = await updateChatTurnFeedback(turnId, next);
      setTurnFeedback(updated.feedback);
    } catch (error) {
      setTurnFeedback(previous);
      setErrorMessage(getChatFeedbackErrorMessage(error));
    } finally {
      feedbackPendingRef.current.delete(turnId);
    }
  };

  const handleToggleList = () => {
    if (!showList) loadSessions();
    setShowList((prev) => !prev);
  };

  const handleNewChat = async () => {
    if (sending || creatingSession) return;
    setShowList(false);
    if (currentSessionId !== null && messages.length === 0 && !loadingTurns && !currentSession?.title) return;

    const requestId = ++turnsRequestRef.current;
    setCreatingSession(true);
    try {
      const session = await createChatSession();
      if (requestId !== turnsRequestRef.current) {
        deleteChatSession(session.id).catch(() => {});
        return;
      }
      discardEmptySession(session.id);
      emptySessionRef.current = session.id;
      setSessions((prev) => [session, ...prev.filter((item) => item.id !== session.id)]);
      setCurrentSessionId(session.id);
      setDraftTitle(null);
      setMessages([]);
      setLoadingTurns(false);
      setInput("");
    } catch {
      if (requestId === turnsRequestRef.current) setErrorMessage(CREATE_SESSION_ERROR_MESSAGE);
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSelectSession = (sessionId: number) => {
    if (sending) return;
    setShowList(false);
    if (sessionId === currentSessionId && messages.length > 0) return;

    discardEmptySession(sessionId);
    setInput("");
    loadTurns(sessionId, ++turnsRequestRef.current);
  };

  const handleRequestDeleteAll = () => {
    if (sending) return;
    setShowList(false);
    setConfirmDeleteAll(true);
  };

  const handleDeleteAll = async () => {
    setConfirmDeleteAll(false);
    if (sending || deletingAll) return;

    setDeletingAll(true);
    try {
      await deleteAllChatSessions();
      emptySessionRef.current = null;
      turnsRequestRef.current += 1;
      setSessions([]);
      setListStatus("ready");
      setCurrentSessionId(null);
      setDraftTitle(null);
      setMessages([]);
      setLoadingTurns(false);
      setInput("");
    } catch {
      setErrorMessage(DELETE_ALL_ERROR_MESSAGE);
    } finally {
      setDeletingAll(false);
    }
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
              <View className="flex-1 items-center pt-spacing-3 px-spacing-7" style={{ gap: getSpacing("spacing-7") }}>
                <View className="bg-neutral-600 rounded-radius-full" style={{ width: 104, height: 4 }} />

                <View className="flex-1 w-full">
                  <ChatHeader
                    title={currentTitle}
                    onPressList={handleToggleList}
                    onPressNewChat={handleNewChat}
                  />

                  {loadingTurns ? (
                    <View className="flex-1 items-center justify-center" style={{ paddingBottom: inputAreaHeight }}>
                      <Text variant="base-large" color="disabled">대화를 불러오는 중...</Text>
                    </View>
                  ) : messages.length === 0 && !sending ? (
                    <View className="flex-1 justify-end" style={{ paddingBottom: inputAreaHeight + MESSAGE_GAP }}>
                      <ChatSuggestions onSelect={handleSelectSuggestion} />
                    </View>
                  ) : (
                    <View className="flex-1 w-full" style={{ marginTop: -HEADER_FADE_HEIGHT }}>
                      <ScrollView
                        ref={scrollRef}
                        className="flex-1 w-full"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingTop: HEADER_FADE_HEIGHT + getSpacing("spacing-3"), paddingBottom: inputAreaHeight + MESSAGE_GAP, gap: MESSAGE_GAP }}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                      >
                        {messages.map((message) => (
                          <ChatMessageItem
                            key={message.id}
                            message={message}
                            onFeedback={message.turnId === null ? undefined : (feedback) => handleFeedback(message, feedback)}
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

                  {messages.length > 0 && (
                    <VerticalGradient
                      className="absolute left-spacing-0 right-spacing-0 bottom-spacing-0"
                      style={{ height: inputFadeHeight }}
                      stops={inputFadeStops}
                    />
                  )}

                  <View
                    className="absolute left-spacing-0 right-spacing-0"
                    style={{ bottom: INPUT_BOTTOM }}
                    onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)}
                  >
                    <ChatInput
                      ref={inputRef}
                      value={input}
                      onChangeText={setInput}
                      onSend={handleSend}
                      sending={sending}
                    />
                  </View>

                  {showList && (
                    <>
                      <Pressable className="absolute inset-spacing-0" onPress={() => setShowList(false)} />
                      <ChatSessionList
                        className="absolute left-spacing-0 right-spacing-0"
                        style={{ top: HEADER_HEIGHT + getSpacing("spacing-4") }}
                        sessions={sessions}
                        status={listStatus}
                        currentId={currentSessionId}
                        now={new Date()}
                        onSelect={handleSelectSession}
                        onDeleteAll={handleRequestDeleteAll}
                      />
                    </>
                  )}

                  {confirmDeleteAll && (
                    <ConfirmDeleteModal
                      title="채팅 목록을 모두 삭제할까요?"
                      description={"삭제한 대화는 되돌릴 수 없어요.\n챗봇이 바꾼 일정은 그대로 남아요."}
                      onCancel={() => setConfirmDeleteAll(false)}
                      onConfirm={handleDeleteAll}
                    />
                  )}

                  {!!errorMessage && <Toast text={errorMessage} onClose={clearError} />}
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
