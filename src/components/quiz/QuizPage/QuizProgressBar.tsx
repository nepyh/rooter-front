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
  current: number;
}

/**
 * 퀴즈 진행 막대. 지금 문제까지 주황색으로 채움
 * @param total 전체 문제 수
 * @param current 지금 문제 위치 (0부터)
 */
export function QuizProgressBar({ total, current }: Props) {
  return (
    <Row gap="xs" className="flex-1 h-[6px] items-center">
      {Array.from({ length: total }, (_, i) => (
        <View key={i} className={`flex-1 h-full rounded-radius-full ${stepStyles[i <= current ? "done" : "todo"]}`} />
      ))}
    </Row>
  );
}
