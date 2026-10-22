import { useState } from "react";
import { View } from "react-native";
import { HourLines } from "./HourLines";
import { BusyBlockView } from "./BusyBlockView";
import { PlanBlockCard } from "./PlanBlockCard";
import { CurrentTimeLine } from "./CurrentTimeLine";
import { columnStyle } from "./styles";
import { useNeighborDay } from "@/hooks/home/useNeighborDay";
import { formatClock } from "@/utils/common/time";
import { toLocalDateString } from "@/utils/common/date";
import { TIMELINE_HEIGHT, TIMELINE_LEFT, layoutColumns, minutesSinceWindowStart } from "@/utils/home/timeline";

// ================================
// Components
// ================================

interface Props {
  width: number;
  offset: number;
  date: Date;
  now: Date;
}

/**
 * 좌우로 넘길 때 옆에 보이는 어제·내일 페이지. 시간 눈금, 바쁜 시간, 계획 블록, 현재 시각 선을 누를 수 없게 그림
 * 그날 일정을 미리 받아 그려두므로 넘기는 중에도 일정이 보임
 * @param width 페이지 너비
 * @param offset 가운데 타임라인과 눈금 높이를 맞출 세로 스크롤 위치
 * @param date 이 페이지의 날짜
 * @param now 현재 시각, 이 페이지가 오늘이면 현재 시각 선을 그림
 */
export function NeighborPage({ width, offset, date, now }: Props) {
  const { dateKey, busyBlocks, plans } = useNeighborDay(date, now);
  const [areaWidth, setAreaWidth] = useState(0);
  const isToday = dateKey === toLocalDateString(now);

  const columns = layoutColumns([
    ...busyBlocks.map((block) => ({ id: `busy:${block.key}`, start: block.start, duration: block.duration })),
    ...plans.map((plan) => ({ id: `plan:${plan.id}`, start: plan.start, duration: plan.duration })),
  ]);
  const columnOf = (id: string) => columns.get(id) ?? { column: 0, columns: 1 };

  return (
    <View pointerEvents="none" className="px-spacing-7" style={{ width, overflow: "hidden" }}>
      <View key={dateKey} style={{ height: TIMELINE_HEIGHT, transform: [{ translateY: -offset }] }}>
        <HourLines />

        <View
          style={{ position: "absolute", top: 0, bottom: 0, left: TIMELINE_LEFT, right: 0 }}
          onLayout={(e) => setAreaWidth(e.nativeEvent.layout.width)}
        >
          {areaWidth > 0 && busyBlocks.map((block) => (
            <BusyBlockView key={block.key} block={block} {...columnOf(`busy:${block.key}`)} areaWidth={areaWidth} />
          ))}
          {areaWidth > 0 && plans.map((plan) => {
            const { column, columns: count } = columnOf(`plan:${plan.id}`);
            return (
              <View
                key={plan.id}
                style={{ position: "absolute", top: plan.start, height: plan.duration, ...columnStyle(column, count, areaWidth) }}
              >
                <PlanBlockCard plan={plan} />
              </View>
            );
          })}
        </View>

        {isToday && <CurrentTimeLine top={minutesSinceWindowStart(now)} label={formatClock(now)} />}
      </View>
    </View>
  );
}
