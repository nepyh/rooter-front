import { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Stack,
  Text,
  Button,
  PageHeader,
  SchoolSearchInput,
  ClassInfoInputs,
  Toast,
} from "@/components";
import { useSchoolEdit } from "@/hooks/more/useSchoolEdit";

// ================================
// Components
// ================================

/**
 * 학교 정보 수정 화면
 * 학교·학년·반을 바꿀 수 있고, 새 학년이 되면 학년만 골라 저장하면 됨
 */
export default function SchoolEditPage() {
  const school = useSchoolEdit();
  const schoolRef = useRef<TextInput>(null);
  const [failed, setFailed] = useState(false);

  const handleEditSchool = () => {
    school.editSchool();
    schoolRef.current?.focus();
  };

  const handleSelectSchool: typeof school.selectSchool = (selected) => {
    school.selectSchool(selected);
    schoolRef.current?.blur();
  };

  const handleSave = async () => {
    if (await school.save())
      router.dismissTo({
        pathname: "/More/Profile",
        params: { toast: "school-updated" },
      });
    else setFailed(true);
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <PageHeader title="학교 정보 수정" />

      <Stack gap="xl" width="full" className="flex-1 pt-spacing-5">
        <Text color="secondary">새 학년이 되면 학년을 바꿔주세요.</Text>
        <SchoolSearchInput
          ref={schoolRef}
          query={school.query}
          selected={school.selected}
          onChangeQuery={school.changeQuery}
          onSelect={handleSelectSchool}
          onEdit={handleEditSchool}
        />
        <ClassInfoInputs
          grade={school.grade}
          classNum={school.classNum}
          onChangeGrade={school.setGrade}
          onChangeClassNum={school.setClassNum}
        />
      </Stack>

      <Button
        variant={school.canSave ? "primary" : "disabled"}
        onPress={handleSave}
        className="mb-spacing-11"
      >
        {school.saving ? "저장 중..." : "저장하기"}
      </Button>
      {failed && (
        <Toast
          text="학교 정보를 저장하지 못했어요. 잠시 후 다시 시도해주세요."
          onClose={() => setFailed(false)}
        />
      )}
    </View>
  );
}
