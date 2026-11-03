import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { TodayButton } from "../../common/TodayButton";
import { Icon } from "@/assets";
import { color } from "@/constants/token/color";
import { formatDateHeader } from "@/utils/home/timeline";

// ================================
// Components
// ================================

interface Props {
  date: Date;
  isToday: boolean;
  examDDay: number | null;
  onPressToday: () => void;
}

/**
 * 홈 맨 위 줄. 보고 있는 날짜, 오늘이 아니면 [오늘로] 버튼, 다가오는 시험 D-Day 를 보여줌
 * @param date 보고 있는 날짜
 * @param isToday 오늘을 보고 있는지
 * @param examDDay 가장 가까운 시험까지 남은 일수, 없으면 null
 * @param onPressToday [오늘로] 를 눌렀을 때 호출
 */
export function HomeHeader({ date, isToday, examDDay, onPressToday }: Props) {
  return (
    <Row width="full" align="between" className="items-center pt-spacing-4 pb-spacing-5">
      <Row gap="m" className="items-center">
        <Text variant="header-large">{formatDateHeader(date)}</Text>
        {!isToday && <TodayButton onPress={onPressToday} />}
      </Row>
      {examDDay !== null && examDDay >= 0 && (
        <Row gap="s" className="items-center">
          <Text variant="base-small" weight="medium" color="secondary">시험</Text>
          <Text variant="header-medium">{examDDay === 0 ? "D-Day" : `D-${examDDay}`}</Text>
        </Row>
      )}
    </Row>
  );
}
