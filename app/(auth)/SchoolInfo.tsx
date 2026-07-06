import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import type { Variant } from "@/components/ui/Button";

// ================================
// Components
// ================================

/**
 * 학교 정보 입력 화면
 * @description 이전 단계에서 선택한 학교를 보여주고, 학년과 반을 입력받습니다.
 */
export default function SchoolInfo() {
  const { school } = useLocalSearchParams<{ school: string }>();

  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [btnVariant, setBtnVariant] = useState<Variant>("disabled");

  const handleComplete = () => {
    router.push({ pathname: "/StudyStyle", params: { school, grade, classNum } });
  };

  useEffect(() => {
    setBtnVariant(!grade || !classNum ? "disabled" : "primary");
  }, [grade, classNum]);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> 학교 정보 입력 </Text>
            <Text color="secondary"> 학년, 반을 입력해주세요 </Text>
          </Stack>
          <Stack width="full" gap="m">
            <Input
              value={school}
              editable={false}
              onChangeText={() => router.back()}
              label="학교명"
            />
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
          </Stack>
        </Stack>
        <Button variant={btnVariant} onPress={handleComplete}> 선택 완료 </Button>
      </Stack>
    </View>
  );
}
