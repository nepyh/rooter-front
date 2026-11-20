import { Pressable, PressableProps, View } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";

// ================================
// Components
// ================================

interface Props extends PressableProps {
  title: string;
  date: string;
  isRepresentative?: boolean;
  className?: string;
}

/**
 * 플랜 목록의 플랜 한 줄. 이름과 시험일을 보여주고, 대표 플랜이면 이름 앞에 '대표' 표시. 누르고 있는 동안 배경이 살짝 어두워짐
 * @param title 플랜 이름
 * @param date 보여줄 시험일 (예: 2026년 8월 10일)
 * @param isRepresentative 대표 플랜인지
 */
export function PlanCard({ title, date, isRepresentative = false, className = "", ...props }: Props) {
  return (
    <Pressable className={`w-full bg-neutral-700 active:bg-neutral-700/60 p-spacing-6 rounded-radius-4 ${className}`} {...props}>
      <Row width="full" align="between" gap="m" className="items-center">
        <Row gap="s" className="flex-1 items-center">
          {isRepresentative && (
            <View className="bg-neutral-600 px-spacing-3 py-spacing-2 rounded-radius-1">
              <Text variant="base-caption" weight="medium" color="secondary">대표</Text>
            </View>
          )}
          <Text variant="base-large" weight="medium" numberOfLines={1} className="flex-1">{title}</Text>
        </Row>
        <Text variant="base-large" color="secondary">{date}</Text>
      </Row>
    </Pressable>
  );
}
