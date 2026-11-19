import { View } from "react-native";

// ================================
// Constants
// ================================

const DOT_SIZE = 6;
// 현재 장을 나타내는 점은 가로로 길게
const ACTIVE_DOT_WIDTH = 20;

// ================================
// Styles
// ================================

type DotState = "active" | "inactive";

const dotStyles: Record<DotState, string> = {
  "active": "bg-primary-500",
  "inactive": "bg-tutorial-dot-inactive",
};

// ================================
// Components
// ================================

interface Props {
  total: number;
  currentIndex: number;
  className?: string;
}

/**
 * 몇 번째 장인지 보여주는 점 목록
 * @param total 전체 장 수를 입력합니다.
 * @param currentIndex 현재 장 번호를 입력합니다. 0부터 시작
 * @param className 바깥 영역 스타일을 덮어씁니다.
 */
export function PageIndicator({ total, currentIndex, className = "" }: Props) {
  return (
    <View
      className={`flex-row items-center justify-center ${className}`}
      style={{ gap: DOT_SIZE }}
    >
      {Array.from({ length: total }, (_, index) => {
        const state: DotState = index === currentIndex ? "active" : "inactive";
        return (
          <View
            key={index}
            className={`rounded-radius-full ${dotStyles[state]}`}
            style={{
              height: DOT_SIZE,
              width: state === "active" ? ACTIVE_DOT_WIDTH : DOT_SIZE,
            }}
          />
        );
      })}
    </View>
  );
}
