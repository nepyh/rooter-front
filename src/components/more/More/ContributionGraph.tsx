import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { WEEKDAYS } from "@/constants/date";
import { color } from "@/constants/token/color";
import { toLocalDateString } from "@/utils/date";
import { buildContributionMonths } from "@/utils/more/contribution";

// ================================
// Styles
// ================================

const levelColors = [
  color.neutral["600"],
  `${color.primary["500"]}33`,
  `${color.primary["500"]}66`,
  `${color.primary["500"]}99`,
  `${color.primary["500"]}CC`,
  color.primary["500"],
];

// ================================
// Components
// ================================

interface Props {
  today: Date;
  weekCount: number;
  levels: Record<string, number>;
}

/**
 * 날짜별 공부 완료율을 칸 색으로 보여주는 잔디 그래프. 처음엔 오른쪽 끝(이번 주)으로 스크롤
 * 0 단계는 회색, 1~5 단계는 주황색 진하기로 표시하고 오늘 이후 칸은 비워 둠
 * @param today 오늘 날짜
 * @param weekCount 보여줄 주 수
 * @param levels 날짜(yyyy-MM-dd) → 색 단계(0~5)
 */
export function ContributionGraph({ today, weekCount, levels }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const months = buildContributionMonths(today, weekCount);

  return (
    <Row gap="s" width="full" className="items-end bg-neutral-700 p-spacing-5 rounded-radius-4">
      <Stack gap="xs">
        {WEEKDAYS.map((weekday) => (
          <View key={weekday} className="w-[20px] h-[20px] items-center justify-center">
            <Text variant="base-small" color="primary">{weekday}</Text>
          </View>
        ))}
      </Stack>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <Row gap="xs">
          {months.map((month, i) => (
            <Stack key={i} gap="s">
              <Text variant="base-small" color="primary">{month.label}</Text>
              <Row gap="xs">
                {month.weeks.map((week, j) => (
                  <Stack key={j} gap="xs">
                    {week.map((day, k) => (
                      day > startOfToday ? (
                        <View key={k} className="w-[20px] h-[20px]" />
                      ) : (
                        <View
                          key={k}
                          className="w-[20px] h-[20px] rounded-radius-1"
                          style={{ backgroundColor: levelColors[levels[toLocalDateString(day)] ?? 0] }}
                        />
                      )
                    ))}
                  </Stack>
                ))}
              </Row>
            </Stack>
          ))}
        </Row>
      </ScrollView>
    </Row>
  );
}
