import { View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Button, Text } from "@/components";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 완료 화면
 */
export default function StudySurveyComplete() {
  const handleNext = () => {
    router.replace({ pathname: "/home", params: { toast: "success" } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1" width="full">
        <Stack gap="xl" width="full">
          <Icon name="mascotFace" size={100} />
          <Stack gap="m" width="full">
            <Text variant="title-medium" className="w-full">공부 스타일 분석을 완료했어요</Text>
            <Text variant="base-large" className="w-full">
              내 프로필에서 언제든지 다시{"\n"}공부 스타일을 분석할 수 있어요.
            </Text>
          </Stack>
        </Stack>
        <Button variant="primary" onPress={handleNext}>다음</Button>
      </Stack>
    </View>
  );
}
