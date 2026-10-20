import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Stack } from "../../layout";
import { MascotBubble } from "../common/MascotBubble";
import { QuestionCard } from "./QuestionCard";
import { QuizOptionRow } from "./QuizOptionRow";
import type { TaskQuizQuestion } from "@/api/quiz/QuizPage";
import type { OptionState } from "@/utils/quiz/quiz";

// ================================
// Components
// ================================

interface Props {
  question: TaskQuizQuestion;
  index: number;
  optionStateOf: (choiceId: number) => OptionState;
  onSelect?: (choiceId: number) => void;
  bubbleText: string | null;
}

/**
 * 문제 카드와 보기 목록 (세로 스크롤). 해설 말풍선은 보기 위에 겹쳐 띄우고,
 * 마지막 보기가 가리지 않도록 말풍선 높이만큼 아래 여백을 둠
 * @param question 보여줄 문제
 * @param index 문제 위치 (0부터)
 * @param optionStateOf 보기별 표시 상태를 돌려주는 함수
 * @param onSelect 보기를 눌렀을 때 호출, 없으면 보기를 누를 수 없음
 * @param bubbleText 해설 말풍선 문구, 없으면 말풍선을 띄우지 않음
 */
export function QuizQuestionView({ question, index, optionStateOf, onSelect, bubbleText }: Props) {
  const [bubbleHeight, setBubbleHeight] = useState(0);

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bubbleText ? bubbleHeight : 0 }}
      >
        <Stack gap="xxl" width="full">
          <QuestionCard index={index} text={question.questionText} />
          <Stack gap="m" width="full">
            {question.choices.map((choice) => (
              <QuizOptionRow
                key={choice.id}
                label={choice.choiceText}
                state={optionStateOf(choice.id)}
                onPress={onSelect ? () => onSelect(choice.id) : undefined}
              />
            ))}
          </Stack>
        </Stack>
      </ScrollView>
      {bubbleText && (
        <View
          pointerEvents="none"
          className="absolute left-spacing-0 right-spacing-0 bottom-spacing-0 pt-spacing-6 pb-spacing-2"
          onLayout={(e) => setBubbleHeight(e.nativeEvent.layout.height)}
        >
          <MascotBubble text={bubbleText} />
        </View>
      )}
    </>
  );
}
