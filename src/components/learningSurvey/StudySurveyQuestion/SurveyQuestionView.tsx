import { ScrollView } from "react-native";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { OptionRow } from "./OptionRow";
import { Icon } from "@/assets";
import { getSpacing } from "@/utils/common/token";
import type { SurveyQuestion } from "@/api/learningSurvey/StudySurveyQuestion";

// ================================
// Components
// ================================

interface Props {
  question: SurveyQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

/**
 * 마스코트, 문항 제목, 보기 목록으로 된 설문 문항 한 개
 * 작은 화면에서 보기가 아래 버튼에 가려지지 않도록 문항 전체를 스크롤되게 함
 * @param question 보여줄 문항
 * @param selectedIndex 고른 보기 위치, 안 골랐으면 null
 * @param onSelect 보기를 눌렀을 때 호출
 */
export function SurveyQuestionView({ question, selectedIndex, onSelect }: Props) {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: getSpacing("spacing-5") }}
    >
      <Stack gap="l" width="full">
        <Icon name="mascotFace" size={76} />
        <Stack gap="xxl" width="full">
          <Text variant="title-medium" className="w-full">{question.title}</Text>
          <Stack gap="m" width="full">
            {question.options.map((option, index) => (
              <OptionRow key={option} label={option} selected={selectedIndex === index} onPress={() => onSelect(index)} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </ScrollView>
  );
}
