import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Row, Stack } from "../../layout";
import { Button } from "../../ui/Button";
import { Text } from "../../ui/Text";
import { QuizCloseButton } from "./QuizCloseButton";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

interface Props {
  subjectLabel?: string;
  onStart: () => void;
}

/**
 * 퀴즈 시작 화면 (마스코트 + 과목 태그 + "학습 테스트" 안내 + 시작 버튼)
 * @param subjectLabel 과목 이름, 없으면 태그를 숨김
 * @param onStart 시작을 눌렀을 때 호출
 */
export function QuizIntro({ subjectLabel, onStart }: Props) {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full">
          <QuizCloseButton />
          <Stack gap="xl" width="full">
            <Icon name="mascotFace" size={100} />
            <Stack gap="m" width="full">
              <Row gap="m" className="items-center">
                {subjectLabel && (
                  <View className="bg-primary-500/20 px-spacing-3 py-spacing-2 rounded-radius-2">
                    <Text variant="base-medium" weight="medium" style={{ color: color.primary["500"] }}>{subjectLabel}</Text>
                  </View>
                )}
                <Text variant="title-medium">학습 테스트</Text>
              </Row>
              <Text variant="base-large">
                {"사용자의 학습이 제대로 되었는지\n확인하기 위해 학습 테스트를 시작할게요"}
              </Text>
            </Stack>
          </Stack>
        </Stack>
        <Button variant="primary" onPress={onStart}>시작</Button>
      </Stack>
    </View>
  );
}
