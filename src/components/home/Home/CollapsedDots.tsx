import { View, type ViewProps } from "react-native";
import { Row } from "@/components/layout";

// ================================
// Constants
// ================================

const DOTS = [0, 1, 2];

// ================================
// Components
// ================================

interface Props extends ViewProps {
  color: string;
  className?: string;
}

/**
 * 블록이 낮아 글자를 모두 숨겼을 때 대신 보여주는 점 세 개. 남은 높이의 세로 가운데에 놓임
 * @param color 점 색
 */
export function CollapsedDots({ color, className = "", ...props }: Props) {
  return (
    <Row gap="xs" className={`flex-1 items-center ${className}`} {...props}>
      {DOTS.map((dot) => (
        <View
          key={dot}
          className="h-spacing-2 w-spacing-2 rounded-radius-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </Row>
  );
}
