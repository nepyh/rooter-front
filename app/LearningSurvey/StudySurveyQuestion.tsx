import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Button, SurveyProgressBar, SurveyQuestionView } from "@/components";
import { SURVEY_QUESTIONS } from "@/api/learningSurvey/StudySurveyQuestion";

// ================================
// Components
// ================================

/**
 * 공부 스타일 설문 문항 화면
 * plan 이 있으면 플랜 생성 중 설문이라, 마지막 문항 뒤 플랜 생성 화면으로 넘어감
 */
export default function StudySurveyQuestion() {
  const { school, schoolId, grade, classNum, step, answers, plan } = useLocalSearchParams<{
    school: string;
    schoolId: string;
    grade: string;
    classNum: string;
    step: string;
    answers?: string;
    plan?: string;
  }>();
  const stepIndex = Math.min(Math.max(Number(step) || 1, 1), SURVEY_QUESTIONS.length) - 1;
  const isLast = stepIndex === SURVEY_QUESTIONS.length - 1;

  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () => {
    if (selected === null) return;
    const prevAnswers = answers ? answers.split(",") : [];
    const nextAnswers = [...prevAnswers, String(selected)].join(",");

    if (isLast && plan) {
      router.push({ pathname: "/Home/PlanGeneratingPage", params: { plan, answers: nextAnswers } });
      return;
    }

    if (isLast) {
      router.push({ pathname: "/LearningSurvey/StudySurveyLoading", params: { school, schoolId, grade, classNum, answers: nextAnswers } });
      return;
    }

    router.push({
      pathname: "/LearningSurvey/StudySurveyQuestion",
      params: { school, schoolId, grade, classNum, plan, step: String(stepIndex + 2), answers: nextAnswers },
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack gap="xxl" className="flex-1" width="full">
        <SurveyProgressBar total={SURVEY_QUESTIONS.length} currentIndex={stepIndex} />
        <SurveyQuestionView question={SURVEY_QUESTIONS[stepIndex]} selectedIndex={selected} onSelect={setSelected} />
        <Button variant={selected !== null ? "primary" : "disabled"} onPress={handleNext}> 다음 </Button>
      </Stack>
    </View>
  );
}
