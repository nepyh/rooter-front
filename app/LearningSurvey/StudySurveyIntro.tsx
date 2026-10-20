import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Row, Button, SurveyMessageScreen } from "@/components";
import { saveStudentProfile } from "@/api/learningSurvey/common";
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
    if (userId !== null) saveStudentProfile(userId, schoolId, grade, classNum);
    router.replace({ pathname: "/Home/Home", params: { toast: "success" } });
  };

  const handleStart = () => {
    router.push({ pathname: "/LearningSurvey/StudySurveyQuestion", params: { school, schoolId, grade, classNum, step: "1", answers: "" } });
  };

  return (
    <SurveyMessageScreen
      title="공부 스타일 설문"
      description={"설문을 진행하면 사용자의 공부 스타일에\n더욱 맞는 일정을 생성할 수 있어요"}
      footer={
        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" disabled={false} onPress={handleSkip}> 다음에 할게요 </Button>
          </View>
          <View className="flex-1">
            <Button variant="primary" onPress={handleStart}> 설문 시작 </Button>
          </View>
        </Row>
      }
    />
  );
}
