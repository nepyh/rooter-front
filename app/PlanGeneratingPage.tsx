import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Text } from "@/components";
import { Icon } from "@/assets";
import { generatePlan } from "@/api/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/planGeneration";
import { submitStudyStyle } from "@/api/studyStyle";
import palette from "@/constants/palette";

// ================================
// Helpers
// ================================

// 계획 생성 실패 시 백엔드 code별 안내 문구
const GENERATE_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_DATE_RANGE": "시험일은 내일 이후로 선택해주세요.",
  "MISSING_DATE_INFO": "시험 날짜를 다시 선택해주세요.",
  "INVALID_DATE_FORMAT": "시험 날짜를 다시 선택해주세요.",
  "SUBJECTS_REQUIRED": "목차를 하나 이상 선택해주세요.",
  "INVALID_SUBJECT_RANGE": "선택한 목차 범위를 다시 확인해주세요.",
  "INVALID_TITLE": "계획 이름이 올바르지 않아요.",
  "GENERATION_FAILED": "AI가 계획을 만들지 못했어요. 잠시 후 다시 시도해주세요.",
};

const getGenerateErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return "학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";
  if (error.code === "ECONNABORTED") return "계획을 만드는 데 시간이 너무 오래 걸렸어요. 잠시 후 다시 시도해주세요.";
  if (!error.response) return "인터넷 연결을 확인해주세요.";
  return GENERATE_ERROR_MESSAGES[error.response.data?.code] ?? "학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";
};

// ================================
// Components
// ================================

/**
 * 플랜 생성 중 화면, 설문 답변 저장 뒤 AI 계획 생성
 */
export default function PlanGeneratingPage() {
  const { plan, answers } = useLocalSearchParams<{ plan: string; answers?: string }>();
  // 로딩 중 뒤로 나가면 늦게 온 생성 결과로 화면을 옮기지 않음
  const leftRef = useRef(false);

  useEffect(() => {
    const { examDate, subjects } = JSON.parse(plan ?? "{}") as { examDate?: string; subjects?: string };

    const run = async () => {
      // 설문 답변이 계획에 반영되도록 먼저 저장, 실패해도 생성은 진행
      if (answers) {
        const studyStyleAnswers = answers.split(",").map((selectedIndex, i) => ({
          questionNumber: i + 1,
          answerOption: Number(selectedIndex) + 1,
        }));
        await submitStudyStyle(studyStyleAnswers).catch(() => {});
      }
      try {
        await generatePlan({
          title: examDate ? `${examDate} 시험 대비` : "새 학습 계획",
          subjects: JSON.parse(subjects ?? "[]") as PlanGenerationSubjectInput[],
          examDate: examDate || undefined,
        });
        if (!leftRef.current) router.replace("/home");
      } catch (error) {
        if (leftRef.current) return;
        Alert.alert("계획 생성 실패", getGenerateErrorMessage(error), [{ text: "확인", onPress: () => router.back() }]);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 설문 마지막 문항으로 돌아감
  const goBack = () => {
    leftRef.current = true;
    if (router.canGoBack()) router.back(); else router.replace("/home");
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <View className="flex-row items-center pb-l">
        <Pressable onPress={goBack}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center" style={{ gap: 28 }}>
        <ActivityIndicator size="large" color={palette.primary["500"]} />
        <Text variant="title-small">플랜 생성 중...</Text>
      </View>
    </View>
  );
}
