import { Pressable, PressableProps } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { Icon, type IconName } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Constants
// ================================

const BUTTON_SIZE = 44;

// ================================
// Components
// ================================

interface HeaderButtonProps extends PressableProps {
  icon: IconName;
}

function HeaderButton({ icon, ...props }: HeaderButtonProps) {
  return (
    <Pressable
      className="items-center justify-center rounded-radius-full bg-neutral-700"
      style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
      hitSlop={4}
      {...props}
    >
      <Icon name={icon} size={24} color={color.neutral["0"]} />
    </Pressable>
  );
}

interface Props {
  title: string | null;
  onPressList: () => void;
  onPressNewChat: () => void;
}

/**
 * AI 채팅 상단 바
 * @param title 지금 대화의 제목 (없으면 비워둠)
 * @param onPressList 채팅 목록 버튼을 눌렀을 때 호출
 * @param onPressNewChat 새 채팅 버튼을 눌렀을 때 호출
 */
export function ChatHeader({ title, onPressList, onPressNewChat }: Props) {
  return (
    <Row width="full" align="between" className="items-center pb-spacing-10">
      <HeaderButton icon="listMinus" onPress={onPressList} accessibilityLabel="채팅 목록" />
      <Text variant="header-medium" numberOfLines={1} className="flex-1 text-center px-spacing-6">
        {title ?? ""}
      </Text>
      <HeaderButton icon="messagePlus" onPress={onPressNewChat} accessibilityLabel="새 채팅" />
    </Row>
  );
}
