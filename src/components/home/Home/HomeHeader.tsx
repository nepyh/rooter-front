import { Pressable } from "react-native";
import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { TodayButton } from "../../common/TodayButton";
import { formatDateHeader } from "@/utils/home/timeline";

// ================================
// Helpers
// ================================

/**
 * 시험까지 남은 일수를 D-Day 문구로 바꿈
 * @param dDay 남은 일수
 * @returns D-Day 문구, 보여줄 D-Day 가 없거나 시험이 지났으면 null
 */
const formatDDay = (dDay: number | null) => {
  if (dDay === null || dDay < 0) return null;
  return dDay === 0 ? "D-Day" : `D-${dDay}`;
};

// ================================
// Components
// ================================

interface Props {
  date: Date;
  isToday: boolean;
  planLoaded: boolean;
  examTitle: string | null;
  examDDay: number | null;
  onPressToday: () => void;
  onPressDDay: () => void;
}

/**
 * 홈 맨 위 줄. 보고 있는 날짜, 오늘이 아니면 [오늘로] 버튼, 대표 플랜의 이름과 시험 D-Day 를 보여줌

 * @param date 보고 있는 날짜
 * @param isToday 오늘을 보고 있는지
 * @param planLoaded 플랜 목록을 불러왔는지. 불러오기 전에는 D-Day 자리를 비워 둠
 * @param examTitle 대표 플랜 이름, 대표 플랜이 없으면 null
 * @param examDDay 대표 플랜 시험까지 남은 일수, 대표 플랜이 없으면 null
 * @param onPressToday [오늘로] 를 눌렀을 때 호출
 * @param onPressDDay D-Day 를 눌렀을 때 호출
 */
export function HomeHeader({ date, isToday, planLoaded, examTitle, examDDay, onPressToday, onPressDDay }: Props) {
  const dDayLabel = formatDDay(examDDay);

  return (
    <Row width="full" align="between" className="items-center pt-spacing-4 pb-spacing-5">
      <Row gap="m" className="items-center">
        <Text variant="header-large">{formatDateHeader(date)}</Text>
        {!isToday && <TodayButton onPress={onPressToday} />}
      </Row>
      {planLoaded && (
        <Pressable
          onPress={onPressDDay}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="플랜 목록 보기"
          className="flex-shrink ml-spacing-5"
        >
          <Row gap="s" className="items-center">
            {dDayLabel !== null && (
              <Text variant="base-small" weight="medium" color="secondary" numberOfLines={1} className="flex-shrink">{examTitle}</Text>
            )}
            <Text variant="header-medium">{dDayLabel ?? "D-DAY"}</Text>
          </Row>
        </Pressable>
      )}
    </Row>
  );
}
