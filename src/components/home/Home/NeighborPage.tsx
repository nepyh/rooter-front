import { View } from "react-native";
import { HourLines } from "./HourLines";
import { TIMELINE_HEIGHT } from "@/utils/home/timeline";

// ================================
// Components
// ================================

interface Props {
  width: number;
  offset: number;
}

/**
 * 좌우로 넘길 때 옆에 살짝 보이는 어제·내일 페이지. 시간 눈금만 그림
 * @param width 페이지 너비
 * @param offset 가운데 타임라인과 눈금 높이를 맞출 세로 스크롤 위치
 */
export function NeighborPage({ width, offset }: Props) {
  return (
    <View style={{ width, overflow: "hidden" }}>
      <View style={{ height: TIMELINE_HEIGHT, transform: [{ translateY: -offset }] }}>
        <HourLines />
      </View>
    </View>
  );
}
