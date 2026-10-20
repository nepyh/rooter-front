import { router } from "expo-router";
import { Button, SurveyMessageScreen } from "@/components";

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 완료 화면
 */
export default function StudySurveyComplete() {
  const handleNext = () => {
    router.replace({ pathname: "/Home/Home", params: { toast: "success" } });
  };

  return (
    <SurveyMessageScreen
      title="공부 스타일 분석을 완료했어요"
      description={"내 프로필에서 언제든지 다시\n공부 스타일을 분석할 수 있어요."}
      footer={<Button variant="primary" onPress={handleNext}>다음</Button>}
    />
  );
}
