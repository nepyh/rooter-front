import { router, useLocalSearchParams } from "expo-router";
import { Button, SurveyMessageScreen } from "@/components";

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 완료 화면
 */
export default function StudySurveyComplete() {
  const { from } = useLocalSearchParams<{ from?: "AccountSetting" }>();

  const handleNext = () => {
    // 가입 중이면 홈 전에 튜토리얼을 보여주고, 마이페이지에서 다시 한 설문은 바로 홈으로
    if (from === "AccountSetting") router.replace({ pathname: "/Home/Home", params: { toast: "study-survey-completed" } });
    else router.replace("/Tutorial/Tutorial");
  };

  return (
    <SurveyMessageScreen
      title="공부 스타일 분석을 완료했어요"
      description={"내 프로필에서 언제든지 다시\n공부 스타일을 분석할 수 있어요."}
      footer={<Button variant="primary" onPress={handleNext}>다음</Button>}
    />
  );
}
