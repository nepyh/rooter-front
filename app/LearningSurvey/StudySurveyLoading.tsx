import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LoadingScreen } from "@/components";
import { saveStudentProfile, saveStudyStyleAnswers } from "@/api/learningSurvey/common";
import { useUserStore } from "@/store";

// ================================
// Constants
// ================================

const ANALYZE_MS = 1600;

// ================================
// Components
// ================================

/**
 * 공부 스타일 분석 중 화면
 */
export default function StudySurveyLoading() {
  const { schoolId, grade, classNum, answers } = useLocalSearchParams<{
    schoolId: string;
    grade: string;
    classNum: string;
    answers?: string;
  }>();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    if (userId !== null) saveStudentProfile(userId, schoolId, grade, classNum);
    if (answers) saveStudyStyleAnswers(answers);
    const timer = setTimeout(() => {
      router.replace("/LearningSurvey/StudySurveyComplete");
    }, ANALYZE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingScreen text="공부 스타일 분석 중..." onBack={() => router.back()} />;
}
