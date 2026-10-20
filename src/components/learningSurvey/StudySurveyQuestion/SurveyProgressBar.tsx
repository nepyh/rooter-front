import { View } from "react-native";
import { Row } from "../../layout";

// ================================
// Types
// ================================

type State = "done" | "todo";

// ================================
// Styles
// ================================

const stepStyles: Record<State, string> = {
  "done": "bg-primary-500",
  "todo": "bg-neutral-600",
};

// ================================
// Components
// ================================

interface Props {
  total: number;
  currentIndex: number;
}

/**
 * 설문 진행 막대. 지금 문항까지 주황색으로 채움
 * @param total 전체 문항 수
 * @param currentIndex 지금 문항 위치 (0부터)
 */
export function SurveyProgressBar({ total, currentIndex }: Props) {
  return (
    <Row gap="xs" width="full" className="h-[6px] items-center">
      {Array.from({ length: total }, (_, i) => (
        <View key={i} className={`flex-1 h-full rounded-radius-full ${stepStyles[i <= currentIndex ? "done" : "todo"]}`} />
      ))}
    </Row>
  );
}
