import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import type { Variant } from "@/components/ui/Button";

// ================================
// Constants
// ================================

const MOCK_SCHOOLS = [
  "부산국제중학교",
  "부산중앙중학교",
  "부산예술중학교",
  "서울고등학교",
  "서울중앙중학교",
  "인천국제중학교",
];

// ================================
// Components
// ================================

/**
 * 학교 선택 화면
 * @description 학교명을 입력해 목록에서 검색하고, 목록에 있는 학교를 정확히 선택해야 다음 단계로 진행할 수 있습니다.
 */
export default function SchoolSelect() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(false);

  const schoolRef = useRef<TextInput>(null);

  const filtered = MOCK_SCHOOLS.filter((school) => school.includes(query));
  const showSuggestions = query.length > 0 && !selected;

  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    setSelected(false);
  };

  const handleSelect = (school: string) => {
    setQuery(school);
    setSelected(true);
    schoolRef.current?.blur();
  };

  const handleComplete = () => {
    router.push({ pathname: "/SchoolInfo", params: { school: query } });
  };

  useEffect(() => {
    setBtnVariant(selected ? "primary" : "disabled");
  }, [selected]);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> 학교 선택 </Text>
            <Text color="secondary"> 현재 재학 중인 학교를 선택해주세요 </Text>
          </Stack>
          <Stack width="full" gap="m">
            <Input
              ref={schoolRef}
              value={query}
              onChangeText={handleChangeQuery}
              label="학교명"
              placeholder="학교 이름을 입력해주세요."
            />
            {showSuggestions && (
              <Stack width="full" className="bg-neutral-700 rounded-md overflow-hidden">
                {filtered.map((school) => (
                  <Pressable key={school} className="p-xl w-full" onPress={() => handleSelect(school)}>
                    <Text variant="base-large" weight="medium"> {school} </Text>
                  </Pressable>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
        <Stack gap="l" width="full">
          <Button variant={btnVariant} onPress={handleComplete}> 선택 완료 </Button>
          <Row gap="s" width="full" className="justify-center items-end">
            <Text color="disabled"> 재학 중인 학교가 없나요? </Text>
            <Text weight="medium" className="text-primary-500 underline"> 문의하기 </Text>
          </Row>
        </Stack>
      </Stack>
    </View>
  );
}
