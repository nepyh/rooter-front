import { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Button, Text } from "@/components";
import { Icon } from "@/assets";
import type { IconName } from "@/assets";

// ================================
// Types
// ================================

type StudyStyleKey = "relaxed" | "normal" | "hard";

// ================================
// Styles
// ================================

const STUDY_STYLES: {
  key: StudyStyleKey;
  icon: IconName;
  title: string;
  subtitle: string;
  hex: string;
  border: string;
  bg: string;
}[] = [
  {
    key: "relaxed",
    icon: "babyLine",
    title: "여유",
    subtitle: "굉장히 여유롭다",
    hex: "#22C55E",
    border: "border-utility-success-primary",
    bg: "bg-utility-success-primary/20",
  },
  {
    key: "normal",
    icon: "windLine",
    title: "보통",
    subtitle: "흠루루",
    hex: "#2D6AF6",
    border: "border-secondary-500",
    bg: "bg-secondary-500/20",
  },
  {
    key: "hard",
    icon: "fireFill",
    title: "어려움",
    subtitle: "굉장히 어렵다",
    hex: "#FF4D4F",
    border: "border-utility-error-primary",
    bg: "bg-utility-error-primary/20",
  },
];

// ================================
// Components
// ================================

/**
 * 공부 스타일 선택 화면
 * @description 여유/보통/어려움 중 하나를 선택하면 설문을 완료하고 홈으로 이동합니다.
 */
export default function StudyStyle() {
  const { school, grade, classNum, textbooks } = useLocalSearchParams<{ school: string; grade: string; classNum: string; textbooks?: string }>();
  const [selected, setSelected] = useState<StudyStyleKey | null>(null);

  const handleComplete = () => {
    // TODO: 학교/학년/반/교과서/공부 스타일 설문 데이터를 저장하는 API가 정해지면 여기서 전송합니다.
    console.log("survey result:", { school, grade, classNum, textbooks, studyStyle: selected });
    router.replace({ pathname: "/", params: { toast: "success" } });
  };

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <Stack align="between" className="flex-1">
        <Stack gap="xxl">
          <Stack gap="s">
            <Text variant="title-medium"> 공부 스타일 선택 </Text>
            <Text color="secondary"> 사용자님의 공부 스타일을 선택해주세요 </Text>
          </Stack>
          <Stack width="full" gap="l">
            {STUDY_STYLES.map((option) => {
              const isSelected = selected === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setSelected(option.key)}
                  className={`
                    w-full p-xl rounded-md border-2 flex-row items-center gap-m
                    ${isSelected ? `${option.border} ${option.bg}` : "border-neutral-500"}
                  `}
                >
                  <Icon name={option.icon} size={40} color={isSelected ? option.hex : "#6B7280"} />
                  <Stack gap="xs">
                    <Text weight="medium" style={{ color: isSelected ? option.hex : "#6B7280" }}>
                      {option.title}
                    </Text>
                    <Text style={{ color: isSelected ? option.hex : "#6B7280" }}>
                      {option.subtitle}
                    </Text>
                  </Stack>
                </Pressable>
              );
            })}
          </Stack>
        </Stack>
        <Button variant={selected ? "primary" : "disabled"} onPress={handleComplete}> 선택 완료 </Button>
      </Stack>
    </View>
  );
}
