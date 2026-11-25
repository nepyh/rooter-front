import { useEffect } from "react";
import { BackHandler, View, Pressable } from "react-native";
import { Slot, router, useGlobalSearchParams, usePathname } from "expo-router";
import { Stack } from "@/components";
import { Icon } from "@/assets";

// ================================
// Types
// ================================

type SchoolParams = {
  school?: string;
  schoolId?: string;
  grade?: string;
  classNum?: string;
};

// ================================
// Constants
// ================================

// 공통 헤더를 빼고 보여줄 화면
// 문항 화면은 진행 막대를 붙인 헤더를 직접 그리고, 분석 중 화면은 뒤로가기가 없음
const NO_HEADER_PATHS = [
  "/LearningSurvey/StudySurveyQuestion",
  "/LearningSurvey/StudySurveyLoading",
];

const INTRO_PATH = "/LearningSurvey/StudySurveyIntro";

// ================================
// Helpers
// ================================

/**
 * 고른 학교·학년·반을 넘겨 학교 선택 화면으로 바꿔 보냄
 * @param params 설문 안내가 받은 학교·학년·반
 */
const replaceToSchoolSelect = (params: SchoolParams) => router.replace({ pathname: "/Auth/SchoolSelect", params: { ...params } });

// ================================
// Components
// ================================

export default function LearningSurveyLayout() {
  const pathname = usePathname();
  const { school, schoolId, grade, classNum, from } = useGlobalSearchParams<SchoolParams & { from?: "AccountSetting" }>();
  const showHeader = !NO_HEADER_PATHS.includes(pathname);

  // 회원가입 중 학교 선택에서 온 설문 안내는, 그냥 뒤로 가면 Auth 묶음이 첫 화면(로그인)부터 다시 만들어짐
  // 고른 학교·학년·반을 넘겨 학교 선택으로 바꿔 보냄
  const backToSchoolSelect = pathname === INTRO_PATH && from !== "AccountSetting";

  const goBack = () => {
    if (!backToSchoolSelect) {
      router.back();
      return;
    }
    replaceToSchoolSelect({ school, schoolId, grade, classNum });
  };

  // 안드로이드 뒤로가기도 헤더 뒤로가기와 똑같이
  useEffect(() => {
    if (!backToSchoolSelect) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      replaceToSchoolSelect({ school, schoolId, grade, classNum });
      return true;
    });
    return () => subscription.remove();
  }, [backToSchoolSelect, school, schoolId, grade, classNum]);

  return (
    <Stack gap="xl" className="flex-1 pb-spacing-11">
      {showHeader && (
        <View className="py-spacing-5">
          <Pressable onPress={goBack}>
            <Icon name="chevronLeft" size={32} />
          </Pressable>
        </View>
      )}
      <Slot />
    </Stack>
  );
}
