import { Pressable, View } from "react-native";
import { Row } from "../../layout";
import { SurveyProgressBar } from "./SurveyProgressBar";
import { Icon } from "@/assets";

// ================================
// Components
// ================================

interface Props {
  total: number;
  currentIndex: number;
  onBack: () => void;
}

/**
 * 뒤로가기 버튼 옆에 설문 진행 막대가 붙은 설문 문항 화면 맨 위 줄
 * @param total 전체 문항 수
 * @param currentIndex 지금 문항 위치 (0부터)
 * @param onBack 뒤로가기 버튼을 눌렀을 때 호출
 */
export function SurveyQuestionHeader({ total, currentIndex, onBack }: Props) {
  return (
    <Row gap="l" width="full" className="items-center py-spacing-5">
      <Pressable onPress={onBack}>
        <Icon name="chevronLeft" size={32} />
      </Pressable>
      <View className="flex-1">
        <SurveyProgressBar total={total} currentIndex={currentIndex} />
      </View>
    </Row>
  );
}
