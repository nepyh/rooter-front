import { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";
import type { PlanTask } from "@/api/common/planBoard";
import { color } from "@/constants/token/color";

// ================================
// Styles
// ================================

const TODO_CHECKBOX_STYLE = { borderWidth: 1, borderColor: color.neutral["400"] };

const COMPLETED_TITLE_STYLE = { textDecorationLine: "line-through" as const };

// ================================
// Components
// ================================

interface Props {
  task: PlanTask;
  accentColor?: string;
  onToggle: () => void;
}

/**
 * 할 일 한 줄 (체크박스 + 이름). 완료되는 순간 체크박스가 톡 튀는 애니메이션
 * @param task 보여줄 할 일
 * @param accentColor 완료한 체크박스 배경색, 생략하면 primary-500
 * @param onToggle 줄을 눌렀을 때 호출
 */
export function TaskRow({ task, accentColor = color.primary["500"], onToggle }: Props) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (task.isCompleted) {
      scale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    }
  }, [task.isCompleted, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onToggle}>
      <Row gap="s" className="items-center">
        <Animated.View
          className="w-[14px] h-[14px] rounded-radius-1 items-center justify-center"
          style={[task.isCompleted ? { backgroundColor: accentColor } : TODO_CHECKBOX_STYLE, boxStyle]}
        >
          {task.isCompleted && <Icon name="check" size={8} color={color.neutral["0"]} />}
        </Animated.View>
        <Text
          variant="base-medium"
          color={task.isCompleted ? "disabled" : "primary"}
          className="flex-1"
          style={task.isCompleted ? COMPLETED_TITLE_STYLE : undefined}
        >
          {task.taskName}
        </Text>
      </Row>
    </Pressable>
  );
}
