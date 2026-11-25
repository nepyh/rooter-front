import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Row, Button, SurveyMessageScreen } from "@/components";
import { useSaveStudentProfile } from "@/hooks/learningSurvey/useSaveStudentProfile";

// ================================
// Components
// ================================

/**
 * 공부 스타일 설문 안내 화면
 * from 이 AccountSetting 이면 계정 설정에서 시작한 설문이라, 건너뛰면 학생 프로필 저장 없이 홈으로 넘어감
 */
export default function StudySurveyIntro() {
  const { school, schoolId, grade, classNum, from } = useLocalSearchParams<{
    school: string;
    schoolId: string;
    grade: string;
    classNum: string;
    from?: "AccountSetting";
  }>();
  const saveProfile = useSaveStudentProfile();

  const handleSkip = async () => {
    if (from === "AccountSetting") {
      router.replace("/Home/Home");
      return;
    }

    if (await saveProfile({ school, schoolId, grade, classNum })) router.replace("/Tutorial/Tutorial");
  };

  const handleStart = () => {
    router.push({ pathname: "/LearningSurvey/StudySurveyQuestion", params: { school, schoolId, grade, classNum, from, step: "1", answers: "" } });
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
