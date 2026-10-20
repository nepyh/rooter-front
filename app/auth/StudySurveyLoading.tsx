import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LoadingScreen } from "@/components";
import { createStudentProfile } from "@/api/user";
import { submitStudyStyle } from "@/api/studyStyle";
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
    if (userId !== null) {
      createStudentProfile(userId, { schoolId, grade: Number(grade), classNumber: Number(classNum) }).catch(() => {});
    }
    if (answers) {
      const studyStyleAnswers = answers.split(",").map((selectedIndex, i) => ({
        questionNumber: i + 1,
        answerOption: Number(selectedIndex) + 1,
      }));
      submitStudyStyle(studyStyleAnswers).catch(() => {});
    }
    const timer = setTimeout(() => {
      router.replace("/auth/StudySurveyComplete");
    }, ANALYZE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마지막 문항으로 돌아가 답을 바꿀 수 있음
  return <LoadingScreen text="공부 스타일 분석 중..." onBack={() => router.back()} />;
}
