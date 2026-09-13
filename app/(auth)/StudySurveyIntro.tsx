import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Button, Text } from "@/components";
import { Icon } from "@/assets";
import { createStudentProfile } from "@/api/user";
import { useUserStore } from "@/store";

// ================================
// Components
// ================================

/**
 * 공부 스타일 설문 안내 화면
 */
export default function StudySurveyIntro() {
  const { school, schoolId, grade, classNum } = useLocalSearchParams<{
    school: string;
    schoolId: string;
    grade: string;
    classNum: string;
  }>();
  const userId = useUserStore((state) => state.userId);

  const handleSkip = () => {
    if (userId !== null) {
      createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) }).catch(() => {});
    }
    router.replace({ pathname: "/", params: { toast: "success" } });
  };

  const handleStart = () => {
    router.push({ pathname: "/StudySurveyQuestion", params: { school, schoolId, grade, classNum, step: "1", answers: "" } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" className="flex-1" width="full">
        <Stack gap="xl" width="full">
          <Icon name="mascotFace" size={100} />
          <Stack gap="m" width="full">
            <Text variant="title-medium" className="w-full">공부 스타일 설문</Text>
            <Text variant="base-large" className="w-full">
              설문을 진행하면 사용자의 공부 스타일에{"\n"}더욱 맞는 일정을 생성할 수 있어요
            </Text>
          </Stack>
        </Stack>
        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" disabled={false} onPress={handleSkip}> 다음에 할게요 </Button>
          </View>
          <View className="flex-1">
            <Button variant="primary" onPress={handleStart}> 설문 시작 </Button>
          </View>
        </Row>
      </Stack>
    </View>
  );
}
