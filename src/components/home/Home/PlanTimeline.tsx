import type { Ref } from "react";
import { ScrollView, View } from "react-native";
import { HourLines } from "./HourLines";
import { BusyBlockView } from "./BusyBlockView";
import { PlanBlock } from "./PlanBlock";
import { CurrentTimeLine } from "./CurrentTimeLine";
import { ActionMenu } from "./ActionMenu";
import {
  TIMELINE_HEIGHT,
  TIMELINE_LEFT,
  formatClock,
  layoutPlanColumns,
  minutesSinceWindowStart,
  type BusyBlock,
  type Plan,
} from "@/utils/home/timeline";

// ================================
// Components
// ================================

interface Props {
  ref?: Ref<ScrollView>;
  dateKey: string;
  busyBlocks: BusyBlock[];
  plans: Plan[];
  currentTime: Date | null;
  activePlan: Plan | null;
  canDeleteActive: boolean;
  onSelectPlan: (plan: Plan) => void;
  onComplete: (plan: Plan) => void;
  onFail: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onScrollY: (y: number) => void;
  onViewportHeight: (height: number) => void;
}

/**
 * 하루 24시간 세로 타임라인. 시간 눈금, 바쁜 시간, 계획 블록, 현재 시각 선, 액션 메뉴를 겹쳐 그림
 * 겹치는 계획은 칸을 나눠 나란히 놓음
 * @param dateKey 보고 있는 날짜 (YYYY-MM-DD), 날짜가 바뀌면 타임라인을 새로 그림
 * @param busyBlocks 수면·학교·불가능 시간 블록
 * @param plans 계획 목록
 * @param currentTime 현재 시각 선을 그릴 시각, 오늘이 아니면 null
 * @param activePlan 액션 메뉴를 띄울 계획
 * @param canDeleteActive 액션 메뉴에 삭제 버튼을 보여줄지
 * @param onSelectPlan 계획 블록을 눌렀을 때 호출
 * @param onComplete 액션 메뉴의 완료를 눌렀을 때 호출
 * @param onFail 액션 메뉴의 실패를 눌렀을 때 호출
 * @param onEdit 액션 메뉴의 수정을 눌렀을 때 호출
 * @param onDelete 액션 메뉴의 삭제를 눌렀을 때 호출
 * @param onScrollY 세로 스크롤 위치가 바뀔 때 호출
 * @param onViewportHeight 화면에 보이는 타임라인 높이를 잰 뒤 호출
 */
export function PlanTimeline({
  ref,
  dateKey,
  busyBlocks,
  plans,
  currentTime,
  activePlan,
  canDeleteActive,
  onSelectPlan,
  onComplete,
  onFail,
  onEdit,
  onDelete,
  onScrollY,
  onViewportHeight,
}: Props) {
  const planColumns = layoutPlanColumns(plans);

  return (
    <ScrollView
      ref={ref}
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={(e) => onScrollY(e.nativeEvent.contentOffset.y)}
      onLayout={(e) => onViewportHeight(e.nativeEvent.layout.height)}
    >
      <View key={dateKey} style={{ height: TIMELINE_HEIGHT, position: "relative" }}>
        <HourLines />

        {busyBlocks.map((block) => (
          <BusyBlockView key={block.key} block={block} />
        ))}

        <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: TIMELINE_LEFT, right: 0 }}>
          {plans.map((plan) => {
            const { column, columns } = planColumns.get(plan.id) ?? { column: 0, columns: 1 };
            return <PlanBlock key={plan.id} plan={plan} column={column} columns={columns} onPress={() => onSelectPlan(plan)} />;
          })}
        </View>

        {currentTime && <CurrentTimeLine top={minutesSinceWindowStart(currentTime)} label={formatClock(currentTime)} />}

        {activePlan && (
          <ActionMenu
            key={activePlan.id}
            plan={activePlan}
            canDelete={canDeleteActive}
            onComplete={() => onComplete(activePlan)}
            onFail={() => onFail(activePlan)}
            onEdit={() => onEdit(activePlan)}
            onDelete={() => onDelete(activePlan)}
          />
        )}
      </View>
    </ScrollView>
  );
}
