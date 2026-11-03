import { Pressable, View, ViewProps } from "react-native";
import { Text } from "../../ui/Text";
import { Icon, type IconName } from "@/assets";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Constants
// ================================

const CHIP_HEIGHT = 58;
const CHIP_GAP = 10;
const CHIP_ICON_SIZE = 28;

const SUGGESTIONS: { icon: IconName; iconColor: string; label: string; prompt: string }[] = [
  { icon: "calendarLine", iconColor: color.primary["500"], label: "일정 조절하기", prompt: "오늘 일정 내일로 미뤄줘" },
  { icon: "pencilLine", iconColor: color.secondary["500"], label: "모르는 문제 질문하기", prompt: "교과서 내용 중에 모르는 게 있어. " },
];

// ================================
// Components
// ================================

interface Props extends ViewProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

/**
 * 대화가 비어 있을 때 입력창 위에 보여주는 예시 문구 버튼
 * @param onSelect 예시 문구를 눌렀을 때 호출. 입력창에 넣을 문장을 넘겨줌
 */
export function ChatSuggestions({ onSelect, className = "", style, ...props }: Props) {
  return (
    <View className={`w-full ${className}`} style={[{ gap: getSpacing("spacing-4") }, style]} {...props}>
      {SUGGESTIONS.map((suggestion) => (
        <Pressable
          key={suggestion.label}
          onPress={() => onSelect(suggestion.prompt)}
          className="flex-row items-center w-full bg-neutral-700/50 border border-neutral-600 rounded-radius-full pl-spacing-6 pr-spacing-3"
          style={{ height: CHIP_HEIGHT, gap: CHIP_GAP }}
        >
          <Icon name={suggestion.icon} size={CHIP_ICON_SIZE} color={suggestion.iconColor} />
          <Text variant="base-large" weight="medium" className="flex-1" style={{ lineHeight: 24 }}>
            {suggestion.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
