import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Stack, Row } from "@/components/layout";
import { Text } from "@/components/ui";
import { Icon } from "@/assets";

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
  onClose: () => void;
}

// ================================
// Constants
// ================================

// AddPlanBoardModal과 동일하게, 배경(Pressable)에 명확한 높이가 없어 퍼센트 높이가 먹지 않으므로
// 화면 실측 높이로 고정 픽셀 값을 계산합니다.
const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.9);

// TODO: 실제 AI 응답 API 연동 전까지 보여줄 목업 답변입니다.
const MOCK_REPLY = "네, 확인했어요! 오늘 일정 조정해볼게요.";

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
 * @description 홈 화면 플러스 버튼 옆 AI 버튼을 누르면 뜨는 바텀시트로, 일정 관련 채팅을 나눕니다.
 */
export function AiChatModal({ visible, onClose }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const [isRendered, setIsRendered] = useState(visible);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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

  // 모달을 새로 열 때마다 이전 대화를 초기화합니다.
  useEffect(() => {
    if (!visible) return;
    setMessages([]);
    setInput("");
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", text: MOCK_REPLY }]);
    }, 600);
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
                    disabled={!input.trim()}
                    className={`items-center justify-center rounded-full ${input.trim() ? "bg-primary-500" : "bg-neutral-600"}`}
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
