import { Pressable, ScrollView, ViewProps } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import type { ChatSession } from "@/api/home/Home/chat";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";
import { parseServerDateTime } from "@/utils/common/date";
import { formatSessionDate } from "@/utils/home/chat";

// ================================
// Types
// ================================

type ItemState = "selected" | "default";
export type ChatSessionListStatus = "loading" | "error" | "ready";

// ================================
// Constants
// ================================

const LIST_MAX_HEIGHT = 384;
const ITEM_LINE_HEIGHT = 24;

const LIST_ENTERING = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -8 }, { scale: 0.96 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: Easing.out(Easing.cubic) },
}).duration(220);

const LIST_EXITING = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { opacity: 0, transform: [{ translateY: -8 }, { scale: 0.96 }], easing: Easing.in(Easing.cubic) },
}).duration(160);

// ================================
// Styles
// ================================

const itemStateStyles: Record<ItemState, string> = {
  "selected": "bg-neutral-600",
  "default": "",
};

const emptyMessages: Record<ChatSessionListStatus, string> = {
  "loading": "채팅 목록을 불러오는 중...",
  "error": "채팅 목록을 불러오지 못했어요",
  "ready": "아직 대화가 없어요",
};

// ================================
// Components
// ================================

interface Props extends ViewProps {
  sessions: ChatSession[];
  status: ChatSessionListStatus;
  currentId: number | null;
  now: Date;
  onSelect: (sessionId: number) => void;
  onDeleteAll: () => void;
  className?: string;
}

/**
 * AI 채팅 목록 팝업
 * @param sessions 보여줄 채팅 목록
 * @param status 목록 조회 상태
 * @param currentId 지금 열려 있는 채팅 ID
 * @param now 날짜 문구 계산 기준 시각
 * @param onSelect 채팅을 눌렀을 때 호출
 * @param onDeleteAll 모두 삭제를 눌렀을 때 호출
 */
export function ChatSessionList({ sessions, status, currentId, now, onSelect, onDeleteAll, className = "", style, ...props }: Props) {
  return (
    <Animated.View
      entering={LIST_ENTERING}
      exiting={LIST_EXITING}
      className={`bg-neutral-700 rounded-radius-4 p-spacing-3 ${className}`}
      style={[{ gap: getSpacing("spacing-3"), transformOrigin: "top left", boxShadow: `0px 4px 2px ${color.chat["list-shadow"]}` }, style]}
      {...props}
    >
      <Row width="full" align="between" className="items-center px-spacing-4 pt-spacing-4 pb-spacing-2">
        <Text variant="header-medium">채팅 목록</Text>
        <Pressable onPress={onDeleteAll} disabled={sessions.length === 0} hitSlop={8}>
          <Text variant="base-medium" color={sessions.length === 0 ? "disabled" : "secondary"}>모두 삭제</Text>
        </Pressable>
      </Row>

      {sessions.length === 0 ? (
        <Text variant="base-large" color="disabled" className="px-spacing-5 py-spacing-4" style={{ lineHeight: ITEM_LINE_HEIGHT }}>
          {emptyMessages[status]}
        </Text>
      ) : (
        <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }} showsVerticalScrollIndicator={false} bounces={false}>
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => onSelect(session.id)}
              className={`flex-row items-center px-spacing-5 py-spacing-4 rounded-radius-3 ${itemStateStyles[session.id === currentId ? "selected" : "default"]}`}
              style={{ gap: getSpacing("spacing-2") }}
            >
              <Text variant="base-large" numberOfLines={1} className="flex-1" style={{ lineHeight: ITEM_LINE_HEIGHT }}>
                {session.title ?? "새 대화"}
              </Text>
              <Text variant="base-large" color="disabled" style={{ lineHeight: ITEM_LINE_HEIGHT }}>
                {formatSessionDate(parseServerDateTime(session.updatedAt), now)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
}
