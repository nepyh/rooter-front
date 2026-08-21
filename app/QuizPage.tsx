import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, Button } from "@/components";
import { Icon } from "@/assets";
import type { Category } from "@/constants/category";

// ================================
// Types
// ================================

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
}

type OptionState = "default" | "selected" | "correct" | "incorrect";

// ================================
// Mock Data
// ================================
// 실제 문제 API가 없어 과목별 목업 문제를 화면에 직접 둡니다 (다른 화면의 MOCK_* 패턴과 동일).

const MOCK_QUIZZES: Record<Category, QuizQuestion[]> = {
  english: [
    { id: "en-1", question: "delicate의 뜻은?", options: ["섬세한", "방해하다", "추측", "모르겠어요"], answerIndex: 0 },
    { id: "en-2", question: "abundant의 뜻은?", options: ["부족한", "풍부한", "지루한", "모르겠어요"], answerIndex: 1 },
    { id: "en-3", question: "postpone의 뜻은?", options: ["연기하다", "제안하다", "완성하다", "모르겠어요"], answerIndex: 0 },
    { id: "en-4", question: "reluctant의 뜻은?", options: ["열정적인", "꺼리는", "너그러운", "모르겠어요"], answerIndex: 1 },
    { id: "en-5", question: "inevitable의 뜻은?", options: ["피할 수 없는", "예상 밖의", "일시적인", "모르겠어요"], answerIndex: 0 },
  ],
  math: [
    { id: "math-1", question: "이차방정식 x² - 5x + 6 = 0의 해는?", options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "모르겠어요"], answerIndex: 0 },
    { id: "math-2", question: "반지름이 r인 원의 넓이 공식은?", options: ["2πr", "πr²", "πr", "모르겠어요"], answerIndex: 1 },
    { id: "math-3", question: "피타고라스 정리에서 빗변 c의 관계식은?", options: ["a + b = c", "a² + b² = c²", "a² - b² = c²", "모르겠어요"], answerIndex: 1 },
    { id: "math-4", question: "다음 중 소수인 것은?", options: ["9", "15", "7", "모르겠어요"], answerIndex: 2 },
    { id: "math-5", question: "함수 y = 2x + 1의 y절편은?", options: ["0", "1", "2", "모르겠어요"], answerIndex: 1 },
  ],
  science: [
    { id: "sci-1", question: "물의 화학식은?", options: ["CO2", "H2O", "O2", "모르겠어요"], answerIndex: 1 },
    { id: "sci-2", question: "세포에서 유전 정보를 담고 있는 곳은?", options: ["핵", "세포막", "미토콘드리아", "모르겠어요"], answerIndex: 0 },
    { id: "sci-3", question: "뉴턴의 제1법칙이 설명하는 것은?", options: ["관성", "작용과 반작용", "가속도", "모르겠어요"], answerIndex: 0 },
    { id: "sci-4", question: "광합성이 일어나는 세포 소기관은?", options: ["엽록체", "리보솜", "소포체", "모르겠어요"], answerIndex: 0 },
    { id: "sci-5", question: "원자핵을 구성하는 입자는?", options: ["전자와 중성자", "양성자와 중성자", "전자와 양성자", "모르겠어요"], answerIndex: 1 },
  ],
  social: [
    { id: "soc-1", question: "대한민국 국회의원의 임기는?", options: ["2년", "4년", "6년", "모르겠어요"], answerIndex: 1 },
    { id: "soc-2", question: "헌법상 국민의 3대 의무 중 하나는?", options: ["납세의 의무", "선거의 의무", "여행의 의무", "모르겠어요"], answerIndex: 0 },
    { id: "soc-3", question: "조선을 건국한 왕은?", options: ["세종대왕", "태조 이성계", "광해군", "모르겠어요"], answerIndex: 1 },
    { id: "soc-4", question: "대한민국 최초의 헌법이 제정된 해는?", options: ["1945년", "1948년", "1950년", "모르겠어요"], answerIndex: 1 },
    { id: "soc-5", question: "국가 권력을 나누어 견제하는 원리는?", options: ["삼권분립", "지방자치", "국민투표", "모르겠어요"], answerIndex: 0 },
  ],
  neutral: [
    { id: "neu-1", question: "학습한 내용을 오래 기억하려면 언제 복습하는 것이 좋을까?", options: ["24시간 이내", "일주일 후", "한 달 후", "모르겠어요"], answerIndex: 0 },
    { id: "neu-2", question: "집중력 향상에 도움이 되는 학습법은?", options: ["뽀모도로 기법", "밤새워 몰아치기", "여러 과목 동시에 하기", "모르겠어요"], answerIndex: 0 },
    { id: "neu-3", question: "좋은 학습 목표의 조건은?", options: ["구체적이고 측정 가능해야 함", "최대한 크게 잡아야 함", "기한이 없어야 함", "모르겠어요"], answerIndex: 0 },
  ],
};

// ================================
// Components
// ================================

function OptionRow({ label, state, onPress }: { label: string; state: OptionState; onPress: () => void }) {
  const stateStyle: Record<OptionState, { borderColor: string; backgroundColor: string }> = {
    default: { borderColor: "#525866", backgroundColor: "transparent" },
    selected: { borderColor: "#F6482D", backgroundColor: "rgba(246,72,45,0.3)" },
    correct: { borderColor: "#22C55E", backgroundColor: "rgba(34,197,94,0.3)" },
    incorrect: { borderColor: "#FF4D4F", backgroundColor: "rgba(255,77,79,0.3)" },
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-s items-center justify-center p-xl rounded-md border-2 w-full"
      style={stateStyle[state]}
    >
      {state === "correct" && <Icon name="check" size={20} color="#22C55E" />}
      {state === "incorrect" && <Icon name="close" size={20} color="#FF4D4F" />}
      <Text variant="base-large">{label}</Text>
    </Pressable>
  );
}

/**
 * 퀴즈 화면
 * @description 과목별 할 일을 모두 완료하면 진입할 수 있는 목업 퀴즈입니다.
 */
export default function QuizPage() {
  const params = useLocalSearchParams<{ category: string }>();
  const category = (params.category as Category) ?? "neutral";
  const questions = MOCK_QUIZZES[category] ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const getOptionState = (index: number): OptionState => {
    if (!confirmed) return selectedIndex === index ? "selected" : "default";
    if (index === current.answerIndex) return "correct";
    if (index === selectedIndex) return "incorrect";
    return "default";
  };

  const handlePrimary = () => {
    if (!confirmed) {
      if (selectedIndex === null) return;
      setConfirmed(true);
      if (selectedIndex === current.answerIndex) setCorrectCount((c) => c + 1);
      return;
    }
    if (isLast) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedIndex(null);
    setConfirmed(false);
  };

  const primaryLabel = !confirmed ? "확인" : isLast ? "결과 보기" : "다음";
  const primaryVariant = !confirmed && selectedIndex === null ? "disabled" : "primary";

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack align="between" width="full" className="flex-1">
        <Stack gap="xxl" width="full" className="flex-1">
          <Row gap="l" width="full" className="items-center">
            <Pressable onPress={() => router.back()} className="w-[28px] h-[28px] items-center justify-center">
              <Icon name="close" size={24} />
            </Pressable>
            <Row gap="xs" className="flex-1 h-[6px] items-center">
              {questions.map((q, i) => (
                <View
                  key={q.id}
                  className="flex-1 h-full rounded-full"
                  style={{ backgroundColor: i <= currentIndex ? "#F6482D" : "#525866" }}
                />
              ))}
            </Row>
          </Row>

          {questions.length === 0 ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text color="secondary">아직 준비된 퀴즈가 없어요.</Text>
            </Stack>
          ) : finished ? (
            <Stack gap="m" width="full" className="flex-1 items-center justify-center">
              <Text variant="title-medium">{correctCount} / {questions.length}</Text>
              <Text color="secondary">퀴즈를 완료했어요!</Text>
            </Stack>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Stack gap="xxl" width="full">
                <View className="bg-neutral-700 rounded-md p-xl w-full">
                  <View className="self-start bg-neutral-600 px-m py-xs rounded-xs">
                    <Text variant="header-small">Q{currentIndex + 1}</Text>
                  </View>
                  <View style={{ height: 40 }} />
                  <Text variant="title-medium" className="text-center">{current.question}</Text>
                </View>

                <Stack gap="m" width="full">
                  {current.options.map((option, index) => (
                    <OptionRow
                      key={`${current.id}-${index}`}
                      label={option}
                      state={getOptionState(index)}
                      onPress={() => !confirmed && setSelectedIndex(index)}
                    />
                  ))}
                </Stack>
              </Stack>
            </ScrollView>
          )}
        </Stack>

        {questions.length === 0 ? (
          <Button variant="primary" onPress={() => router.back()}>확인</Button>
        ) : finished ? (
          <Button variant="primary" onPress={() => router.back()}>완료</Button>
        ) : (
          <Button variant={primaryVariant} onPress={handlePrimary}>{primaryLabel}</Button>
        )}
      </Stack>
    </View>
  );
}
