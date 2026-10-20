import { useRef, useState } from "react";
import { TextInput } from "react-native";
import { router } from "expo-router";
import { AuthScreen, SchoolSearchInput, ClassInfoInputs, SchoolInquiryLink, Stack, Button } from "@/components";
import type { School } from "@/api/auth/SchoolSelect";

// ================================
// Components
// ================================

/**
 * 학교 선택 및 정보 입력 화면
 */
export default function SchoolSelect() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");

  const schoolRef = useRef<TextInput>(null);

  const btnVariant = selected && grade && classNum ? "primary" : "disabled";

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    setSelected(false);
  };

  const handleSelect = (school: School) => {
    // 같은 학교를 다시 고르면 입력해 둔 학년·반을 유지
    if (selectedSchool?.schoolId !== school.schoolId) {
      setGrade("");
      setClassNum("");
    }
    setQuery(school.name);
    setSelected(true);
    setSelectedSchool(school);
    schoolRef.current?.blur();
  };

  const handleEditSchool = () => {
    setSelected(false);
    schoolRef.current?.focus();
  };

  const handleComplete = () => {
    router.push({
      pathname: "/LearningSurvey/StudySurveyIntro",
      params: { school: query, schoolId: selectedSchool?.schoolId ?? "", grade, classNum },
    });
  };

  return (
    <AuthScreen
      title={selected ? "학교 정보 입력" : "학교 선택"}
      description={selected ? "학년, 반을 입력해주세요" : "현재 재학 중인 학교를 선택해주세요"}
      footer={
        <Stack gap="l" width="full">
          <Button variant={btnVariant} onPress={handleComplete}> 선택 완료 </Button>
          {!selected && <SchoolInquiryLink />}
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
      {selectedSchool && (
        <ClassInfoInputs grade={grade} classNum={classNum} onChangeGrade={setGrade} onChangeClassNum={setClassNum} />
      )}
    </AuthScreen>
  );
}
