import { useEffect, useRef } from "react";
import { Pressable, type TextStyle, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { PlanTask } from "@/api/common/planBoard";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

export type TaskRowStatus = "pending" | "done" | "failed";

// ================================
// Styles
// ================================

const TODO_CHECKBOX_STYLE = { borderWidth: 1, borderColor: color.neutral["400"] };

const COMPLETED_TITLE_STYLE = { textDecorationLine: "line-through" as const };

const FAILED_TITLE_STYLE = { textDecorationLine: "line-through" as const, color: color.utility["error-primary"] };

const titleColors: Record<TaskRowStatus, "primary" | "disabled"> = {
  "pending": "primary",
  "done": "disabled",
  "failed": "primary",
};

const titleStyles: Record<TaskRowStatus, TextStyle | undefined> = {
  "pending": undefined,
  "done": COMPLETED_TITLE_STYLE,
  "failed": FAILED_TITLE_STYLE,
};

// ================================
// Components
// ================================

interface Props {
  task: PlanTask;
  status: TaskRowStatus;
  accentColor?: string;
  onToggle: () => void;
}

/**
 * 할 일 한 줄 (체크박스 + 이름). 완료되는 순간 체크박스가 톡 튀는 애니메이션
 * @param task 보여줄 할 일
 * @param status 할 일 상태, failed 면 체크박스 대신 X 표시
 * @param accentColor 완료한 체크박스 배경색, 생략하면 primary-500
 * @param onToggle 줄을 눌렀을 때 호출
 */
export function TaskRow({ task, status, accentColor = color.primary["500"], onToggle }: Props) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);
  const isDone = status === "done";

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isDone) {
      scale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    }
  }, [isDone, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const boxStyles: Record<TaskRowStatus, ViewStyle | undefined> = {
    "pending": TODO_CHECKBOX_STYLE,
    "done": { backgroundColor: accentColor },
    "failed": undefined,
  };

  return (
    <Pressable onPress={onToggle}>
      <Row gap="s" className="items-center">
        <Animated.View
          className="w-[14px] h-[14px] rounded-radius-1 items-center justify-center"
          style={[boxStyles[status], boxStyle]}
        >
          {isDone && <Icon name="check" size={8} color={color.neutral["0"]} />}
          {status === "failed" && <Icon name="close" size={12} color={color.utility["error-primary"]} />}
        </Animated.View>
        <Text
          variant="base-medium"
          color={titleColors[status]}
          className="flex-1"
          style={titleStyles[status]}
        >
          {task.taskName}
        </Text>
      </Row>
    </Pressable>
  );
}
