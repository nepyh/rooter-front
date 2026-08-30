import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Button, Text } from "@/components";
import { Icon } from "@/assets";

// ================================
// Types
// ================================

interface SurveyQuestion {
  title: string;
  options: string[];
}

// ================================
// Mock Data
// ================================
// 실제 설문 문항 API가 없어 화면 흐름을 확인할 수 있도록 목업 문항을 둡니다.

const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    title: "한 번에 최대로 집중할 수 있는\n시간은 어느 정도인가요?",
    options: [
      "짧고 굵게! (20~30분 공부 + 5분 휴식 / 포모도로 스타일)",
      "표준적인 집중력 (45~50분 공부 + 10분 휴식)",
      "몰입형 (90분 이상 쉬지 않고 진도 빼기)",
      "모르겠어요",
    ],
  },
  {
    title: "하루 중 공부가 가장 잘 되는\n시간대는 언제인가요?",
    options: ["아침 (등교 전)", "오후 (학교 마친 직후)", "밤 (자기 전)", "모르겠어요"],
  },
  {
    title: "새로운 내용을 공부할 때\n어떤 방식을 더 선호하나요?",
    options: [
      "교과서를 처음부터 차근차근 읽기",
      "문제부터 풀어보고 안 풀리는 부분만 찾아보기",
      "인강이나 영상으로 먼저 훑어보기",
      "모르겠어요",
    ],
  },
  {
    title: "하루 공부 스케줄에서 가장 변수가 많은 시간대는?",
    options: [
      "방과 후 ~ 저녁 식사 전 (학원, 친구, 집 오자마자 쉬는 시간)",
      "저녁 식사 후 ~ 밤 (스마트폰, 딴짓, 집중력 저하)",
      "주말 전체 (수면 패턴 불규칙, 야외 활동 등)",
      "모르겠어요",
    ],
  },
  {
    title: "시험 기간이 아닐 때, 평소 하루\n자습 시간은 어느 정도인가요?",
    options: ["30분 이하", "30분 ~ 1시간", "1시간 이상", "모르겠어요"],
  },
  {
    title: "계획한 공부를 다 못 끝냈을 때\n주로 어떻게 하나요?",
    options: ["다음 날로 미루고 이어서 한다", "그날 안에 끝까지 마무리한다", "그냥 넘어간다", "모르겠어요"],
  },
  {
    title: "공부할 때 가장 크게 방해가\n되는 요소는 무엇인가요?",
    options: ["스마트폰 알림", "졸음/피로", "소음이나 주변 환경", "모르겠어요"],
  },
];

// ================================
// Components
// ================================

function OptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="border-2 rounded-md p-xl w-full"
      style={{
        borderColor: selected ? "#F6482D" : "#525866",
        backgroundColor: selected ? "rgba(246,72,45,0.3)" : "transparent",
      }}
    >
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}

/**
 * 공부 스타일 설문 문항 화면
 * @description 문항 하나를 보여주고, 다음을 누르면 같은 화면을 다음 문항으로 다시 push합니다.
 */
export default function StudySurveyQuestion() {
  const { school, grade, classNum, step, answers } = useLocalSearchParams<{
    school: string;
    grade: string;
    classNum: string;
    step: string;
    answers?: string;
  }>();
  const stepIndex = Math.min(Math.max(Number(step) || 1, 1), SURVEY_QUESTIONS.length) - 1;
  const question = SURVEY_QUESTIONS[stepIndex];
  const isLast = stepIndex === SURVEY_QUESTIONS.length - 1;

  const [selected, setSelected] = useState<number | null>(null);

  const handleNext = () => {
    if (selected === null) return;
    const prevAnswers = answers ? answers.split(",") : [];
    const nextAnswers = [...prevAnswers, String(selected)].join(",");

    if (isLast) {
      router.push({ pathname: "/StudySurveyLoading", params: { school, grade, classNum, answers: nextAnswers } });
      return;
    }

    router.push({
      pathname: "/StudySurveyQuestion",
      params: { school, grade, classNum, step: String(stepIndex + 2), answers: nextAnswers },
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack gap="xxl" className="flex-1" width="full">
        <Row gap="xs" width="full" className="h-[6px] items-center">
          {SURVEY_QUESTIONS.map((q, i) => (
            <View
              key={q.title}
              className="flex-1 h-full rounded-full"
              style={{ backgroundColor: i <= stepIndex ? "#F6482D" : "#525866" }}
            />
          ))}
        </Row>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Stack gap="l" width="full">
            <Icon name="mascotFace" size={76} />
            <Stack gap="xxl" width="full">
              <Text variant="title-medium" className="w-full">{question.title}</Text>
              <Stack gap="m" width="full">
                {question.options.map((option, index) => (
                  <OptionRow key={option} label={option} selected={selected === index} onPress={() => setSelected(index)} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </ScrollView>

        <Button variant={selected !== null ? "primary" : "disabled"} onPress={handleNext}> 다음 </Button>
      </Stack>
    </View>
  );
}
