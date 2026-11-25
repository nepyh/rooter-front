import { useEffect, useEffectEvent } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { LoadingScreen } from "@/components";
import { saveStudyStyleAnswers } from "@/api/common";
import { useSaveStudentProfile } from "@/hooks/learningSurvey/useSaveStudentProfile";

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
  const { school, schoolId, grade, classNum, answers, from } = useLocalSearchParams<{
    school?: string;
    schoolId: string;
    grade: string;
    classNum: string;
    answers?: string;
    from?: "AccountSetting";
  }>();
  const saveProfile = useSaveStudentProfile();

  // 들어왔을 때 한 번만 저장하고, 분석하는 척 잠시 기다린 뒤 완료 화면으로 넘어감
  // 학생 프로필 저장이 실패해 학교 선택으로 돌아가면 완료 화면으로 넘어가지 않음
  const saveAnswers = useEffectEvent(() => {
    if (answers) saveStudyStyleAnswers(answers);
    if (from === "AccountSetting") return Promise.resolve(true);
    return saveProfile({ school, schoolId, grade, classNum });
  });
  const goComplete = useEffectEvent(() => {
    router.replace({ pathname: "/LearningSurvey/StudySurveyComplete", params: { from } });
  });

  useEffect(() => {
    let cancelled = false;
    const wait = new Promise((resolve) => setTimeout(resolve, ANALYZE_MS));
    Promise.all([saveAnswers(), wait]).then(([saved]) => {
      if (!cancelled && saved) goComplete();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <LoadingScreen text="공부 스타일 분석 중..." />;
}
