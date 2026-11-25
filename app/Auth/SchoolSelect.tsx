import { useCallback, useRef, useState } from "react";
import { BackHandler, TextInput } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { AuthScreen, SchoolSearchInput, ClassInfoInputs, SchoolInquiryLink, Stack, Button, Toast } from "@/components";
import type { School } from "@/api/auth/SchoolSelect";
import { useLogout } from "@/hooks/more/useLogout";
import { useInquiry } from "@/hooks/common/useInquiry";
import { isValidClassNumber } from "@/utils/auth/classNumber";

// ================================
// Components
// ================================

/**
 * 학교 선택 및 정보 입력 화면
 * 이미 로그인된 상태로 오는 화면이라, 뒤로 가면(헤더·안드로이드 뒤로가기) 로그아웃 후 첫 화면으로 보냄
 * 설문 안내에서 뒤로 와서 학교·학년·반을 받으면 고른 상태 그대로 다시 보여줌
 */
export default function SchoolSelect() {
  const params = useLocalSearchParams<{ school?: string; schoolId?: string; grade?: string; classNum?: string }>();
  const [query, setQuery] = useState(params.school ?? "");
  const [selected, setSelected] = useState(!!params.schoolId);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(params.schoolId || null);
  const [grade, setGrade] = useState(params.grade ?? "");
  const [classNum, setClassNum] = useState(params.classNum ?? "");

  const schoolRef = useRef<TextInput>(null);
  const logout = useLogout();
  const inquiry = useInquiry();

  // 안드로이드 뒤로가기도 헤더 뒤로가기(app/Auth/_layout.tsx)와 똑같이 로그아웃
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      logout();
      return true;
    });
    return () => subscription.remove();
  }, [logout]));

  const btnVariant = selected && grade && isValidClassNumber(classNum) ? "primary" : "disabled";

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    setSelected(false);
  };

  const handleSelect = (school: School) => {
    // 같은 학교를 다시 고르면 입력해 둔 학년·반을 유지
    if (selectedSchoolId !== school.schoolId) {
      setGrade("");
      setClassNum("");
    }
    setQuery(school.name);
    setSelected(true);
    setSelectedSchoolId(school.schoolId);
    schoolRef.current?.blur();
  };

  const handleEditSchool = () => {
    setSelected(false);
    schoolRef.current?.focus();
  };

  const handleComplete = () => {
    if (btnVariant === "disabled") return;
    router.push({
      pathname: "/LearningSurvey/StudySurveyIntro",
      params: { school: query, schoolId: selectedSchoolId ?? "", grade, classNum },
    });
  };

  return (
    <AuthScreen
      title={selected ? "학교 정보 입력" : "학교 선택"}
      description={selected ? "학년, 반을 입력해주세요" : "현재 재학 중인 학교를 선택해주세요"}
      footer={
        <Stack gap="l" width="full">
          <Button variant={btnVariant} onPress={handleComplete}> 선택 완료 </Button>
          {!selected && <SchoolInquiryLink onPress={() => inquiry.open("school")} />}
          {!!inquiry.errorMessage && <Toast text={inquiry.errorMessage} onClose={inquiry.clearError} />}
        </Stack>
      }
    >
      <SchoolSearchInput
        ref={schoolRef}
        query={query}
        selected={selected}
        onChangeQuery={handleChangeQuery}
        onSelect={handleSelect}
        onEdit={handleEditSchool}
      />
      {selectedSchoolId && (
        <ClassInfoInputs grade={grade} classNum={classNum} onChangeGrade={setGrade} onChangeClassNum={setClassNum} />
      )}
    </AuthScreen>
  );
}
