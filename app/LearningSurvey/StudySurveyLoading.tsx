import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LoadingScreen } from "@/components";
import { saveStudyStyleAnswers } from "@/api/common";
import { saveStudentProfile } from "@/api/learningSurvey/common";
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
 * from 이 AccountSetting 이면 계정 설정에서 시작한 설문이라, 학교 정보를 받지 않아 학생 프로필은 저장하지 않음
 */
export default function StudySurveyLoading() {
  const { schoolId, grade, classNum, answers, from } = useLocalSearchParams<{
    schoolId: string;
    grade: string;
    classNum: string;
    answers?: string;
    from?: "AccountSetting";
  }>();
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    if (userId !== null && from !== "AccountSetting") saveStudentProfile(userId, schoolId, grade, classNum);
    if (answers) saveStudyStyleAnswers(answers);
    const timer = setTimeout(() => {
      router.replace({ pathname: "/LearningSurvey/StudySurveyComplete", params: { from } });
    }, ANALYZE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingScreen text="공부 스타일 분석 중..." />;
}
