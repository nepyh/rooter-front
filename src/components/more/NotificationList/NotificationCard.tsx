import { Pressable, PressableProps, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon } from "@/assets";

// ================================
// Constants
// ================================

// 24 칸 아래쪽에 붙여, 18×20.8 달력 아이콘이 디자인처럼 위 3px·좌우 3px 자리에 오는 크기
const ICON_SIZE = 20.814;

// ================================
// Components
// ================================

interface Props extends PressableProps {
  title: string;
  body: string;
  time: string;
  className?: string;
}

/**
 * 알림함의 알림 한 장. 왼쪽 달력 아이콘, 제목·지난 시간 한 줄, 그 아래 내용
 * @param title 알림 제목
 * @param body 알림 내용
 * @param time 지난 시간 문구 (방금, 1시간 전 등)
 */
export function NotificationCard({ title, body, time, className = "", ...props }: Props) {
  return (
    <Pressable className={`flex-row items-start gap-spacing-4 p-spacing-5 rounded-radius-4 bg-neutral-700 w-full ${className}`} {...props}>
      <View className="pt-spacing-1">
        <View className="w-spacing-7 h-spacing-7 items-center justify-end">
          <Icon name="calendar" size={ICON_SIZE} />
        </View>
      </View>
      <Stack gap="xs" className="flex-1">
        <Row gap="s" width="full" align="between" className="items-start">
          <Text variant="base-large" weight="medium" className="flex-1">{title}</Text>
          <Text variant="base-small" color="disabled">{time}</Text>
        </Row>
        <Text variant="base-medium">{body}</Text>
      </Stack>
    </Pressable>
  );
}
