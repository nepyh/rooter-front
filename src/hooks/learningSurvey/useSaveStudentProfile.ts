import { Alert } from "react-native";
import { router } from "expo-router";
import { saveStudentProfile } from "@/api/learningSurvey/common";
import { useUserStore } from "@/store";

// ================================
// Types
// ================================

interface SchoolParams {
  school?: string;
  schoolId: string;
  grade: string;
  classNum: string;
}

// ================================
// Hooks
// ================================

/**
 * useSaveStudentProfile — 회원가입 때 고른 학교·학년·반을 학생 프로필로 저장하는 함수를 돌려줌
 * 실패하면 조용히 넘어가지 않고, 다시 시도하거나 학교 선택으로 돌아가 다시 입력하게 물어봄
 * 프로필이 없으면 시간표 반영·추천 교과서가 동작하지 않기 때문
 * @returns save(params) — 저장되면 true, 학교 선택으로 돌아가면 false 로 끝나는 Promise
 */
export function useSaveStudentProfile() {
  const userId = useUserStore((state) => state.userId);

  return (params: SchoolParams) =>
    new Promise<boolean>((resolve) => {
      if (userId === null) {
        resolve(true);
        return;
      }
      const attempt = () => {
        saveStudentProfile(userId, params.schoolId, params.grade, params.classNum)
          .then(() => resolve(true))
          .catch(() =>
            Alert.alert(
              "학교 정보를 저장하지 못했어요",
              "다시 시도하거나 학교 정보를 다시 입력해주세요.",
              [
                {
                  text: "다시 입력",
                  onPress: () => {
                    router.replace({ pathname: "/Auth/SchoolSelect", params: { ...params } });
                    resolve(false);
                  },
                },
                { text: "다시 시도", onPress: attempt },
              ],
              { cancelable: false },
            ),
          );
      };
      attempt();
    });
}
