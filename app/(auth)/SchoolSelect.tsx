import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import type { Variant } from "@/components/ui/Button";
import { searchMiddleSchools, type School } from "@/api/school";

// ================================
// Components
// ================================

/**
 * 학교 선택 및 정보 입력 화면
 * @description 학교명을 입력해 목록에서 검색하고, 학교를 선택하면 같은 화면에서 학년/반을 이어서 입력받습니다.
 */
export default function SchoolSelect() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [schools, setSchools] = useState<School[]>([]);

  const schoolRef = useRef<TextInput>(null);

  const showSuggestions = query.length > 0 && !selected;

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    setSelected(false);
  };

  const handleSelect = (school: School) => {
    setQuery(school.name);
    setSelected(true);
    setGrade("");
    setClassNum("");
    schoolRef.current?.blur();
  };

  const handleEditSchool = () => {
    setSelected(false);
    schoolRef.current?.focus();
  };

  const handleComplete = () => {
    router.push({ pathname: "/TextbookSelect", params: { school: query, grade, classNum } });
  };

  useEffect(() => {
    setBtnVariant(selected && grade && classNum ? "primary" : "disabled");
  }, [selected, grade, classNum]);

  useEffect(() => {
    if (!showSuggestions) {
      setSchools([]);
      return;
    }

    const timer = setTimeout(() => {
      searchMiddleSchools(query)
        .then(setSchools)
        .catch(() => setSchools([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> {selected ? "학교 정보 입력" : "학교 선택"} </Text>
            <Text color="secondary">
              {selected ? "학년, 반을 입력해주세요" : "현재 재학 중인 학교를 선택해주세요"}
            </Text>
          </Stack>
          <Stack width="full" gap="m">
            <Input
              ref={schoolRef}
              value={query}
              onChangeText={handleChangeQuery}
              editable={!selected}
              onPressIn={selected ? handleEditSchool : undefined}
              label="학교명"
              placeholder="학교 이름을 입력해주세요."
            />
            {showSuggestions && (
              <Stack width="full" className="bg-neutral-700 rounded-md overflow-hidden">
                {schools.map((school) => (
                  <Pressable key={school.code} className="p-xl w-full" onPress={() => handleSelect(school)}>
                    <Text variant="base-large" weight="medium">
                      {school.name} ({school.region})
                    </Text>
                  </Pressable>
                ))}
              </Stack>
            )}
            {selected && (
              <Row gap="m" width="full">
                <View className="flex-1">
                  <Input
                    value={grade}
                    onChangeText={setGrade}
                    label="학년"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    value={classNum}
                    onChangeText={setClassNum}
                    label="반"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </Row>
            )}
          </Stack>
        </Stack>
        <Stack gap="l" width="full">
          <Button variant={btnVariant} onPress={handleComplete}> 선택 완료 </Button>
          {!selected && (
            <Row gap="s" width="full" className="justify-center items-end">
              <Text color="disabled"> 재학 중인 학교가 없나요? </Text>
              <Text weight="medium" className="underline" style={{ color: "#F6482D" }}> 문의하기 </Text>
            </Row>
          )}
        </Stack>
      </Stack>
    </View>
  );
}
