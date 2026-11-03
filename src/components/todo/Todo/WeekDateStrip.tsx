import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, View, type ViewToken } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/common/date";
import { addDays, getWeekDates, getWeekOffset } from "@/utils/todo/date";

// ================================
// Types
// ================================

type DayState = "selected" | "default";
type DateMark = "today" | "default";

// ================================
// Constants
// ================================

const PAGE_RANGE = 520;
const PAGES = Array.from({ length: PAGE_RANGE * 2 + 1 }, (_, i) => i - PAGE_RANGE);
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 90 };

// ================================
// Styles
// ================================

const dayStyles: Record<DayState, string> = {
  "selected": "bg-neutral-700",
  "default": "",
};

const dayTextColors: Record<DayState, "primary" | "secondary"> = {
  "selected": "primary",
  "default": "secondary",
};

const dateMarkStyles: Record<DateMark, string> = {
  "today": "bg-primary-500",
  "default": "",
};

const dateMarkTextColors: Record<DateMark, "primary" | undefined> = {
  "today": "primary",
  "default": undefined,
};

// ================================
// Components
// ================================

interface Props {
  centerDate: Date;
  today: Date;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onChangeWeek: (weeks: number) => void;
}

/**
 * 요일 + 날짜로 된 일주일 날짜 줄. 좌우로 밀면 7일씩 넘어가고, 고른 날짜는 배경을 깔고 오늘 날짜는 빨간 원으로 표시
 * 고른 날짜가 보고 있는 7일 밖으로 바뀌면([오늘로] 등) 그 날짜가 있는 페이지로 스크롤하고, 그동안 지나가는 페이지로는 날짜를 바꾸지 않음
 * @param centerDate 처음 보여줄 7일의 가운데 날짜
 * @param today 오늘 날짜
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param onChangeWeek 넘긴 주 수와 함께 호출 (다음 주면 양수, 이전 주면 음수)
 */
export function WeekDateStrip({ centerDate, today, selectedDate, onSelect, onChangeWeek }: Props) {
  const [width, setWidth] = useState(0);
  const listRef = useRef<FlatList<number>>(null);
  const pageRef = useRef(0);
  const jumpTargetRef = useRef<number | null>(null);
  const onChangeWeekRef = useRef(onChangeWeek);
  const selectedPage = getWeekOffset(centerDate, selectedDate);

  useEffect(() => {
    onChangeWeekRef.current = onChangeWeek;
  });

  useEffect(() => {
    if (!width || selectedPage === pageRef.current) return;
    jumpTargetRef.current = selectedPage;
    listRef.current?.scrollToIndex({ index: PAGE_RANGE + selectedPage, animated: true });
  }, [selectedPage, width]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<number>[] }) => {
    const page = viewableItems[0]?.item;
    if (page === undefined || page === pageRef.current) return;
    if (jumpTargetRef.current !== null) {
      if (page !== jumpTargetRef.current) return;
      jumpTargetRef.current = null;
      pageRef.current = page;
      return;
    }
    onChangeWeekRef.current(page - pageRef.current);
    pageRef.current = page;
  }, []);

  return (
    <View className="-mx-spacing-7 border-b border-neutral-600 pb-spacing-4">
      <View className="px-spacing-6">
        <View className="w-full" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <FlatList
              ref={listRef}
              data={PAGES}
              keyExtractor={String}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={PAGE_RANGE}
              initialNumToRender={1}
              windowSize={3}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              viewabilityConfig={VIEWABILITY_CONFIG}
              onViewableItemsChanged={handleViewableItemsChanged}
              extraData={[selectedDate, today]}
              renderItem={({ item: page }) => (
                <Row style={{ width }}>
                  {getWeekDates(addDays(centerDate, page * 7)).map((date, i) => {
                    const state: DayState = isSameDay(date, selectedDate) ? "selected" : "default";
                    const mark: DateMark = isSameDay(date, today) ? "today" : "default";
                    return (
                      <Pressable key={i} onPress={() => onSelect(date)} className={`flex-1 items-center pt-spacing-4 pb-spacing-3 rounded-radius-3 ${dayStyles[state]}`}>
                        <Stack gap="s" align="center" className="items-center">
                          <Text variant="base-medium" color={dayTextColors[state]}>{WEEKDAYS[date.getDay()]}</Text>
                          <View className={`w-spacing-7 h-spacing-7 items-center justify-center rounded-radius-full ${dateMarkStyles[mark]}`}>
                            <Text variant="base-medium" weight="medium" color={dateMarkTextColors[mark] ?? dayTextColors[state]}>{date.getDate()}</Text>
                          </View>
                        </Stack>
                      </Pressable>
                    );
                  })}
                </Row>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
}
