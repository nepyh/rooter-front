import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, View, type ViewToken } from "react-native";
import { Row, Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { WEEKDAYS } from "@/constants/date";
import { isSameDay } from "@/utils/common/date";
import { addDays, getWeekDates } from "@/utils/todo/date";

// ================================
// Constants
// ================================

const PAGE_RANGE = 520;
const PAGES = Array.from({ length: PAGE_RANGE * 2 + 1 }, (_, i) => i - PAGE_RANGE);
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 90 };

// ================================
// Components
// ================================

interface Props {
  centerDate: Date;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onChangeWeek: (weeks: number) => void;
}

/**
 * 요일 + 날짜로 된 일주일 날짜 줄. 좌우로 밀면 7일씩 넘어가고, 고른 날짜만 밝게 표시
 * @param centerDate 처음 보여줄 7일의 가운데 날짜
 * @param selectedDate 고른 날짜
 * @param onSelect 날짜를 눌렀을 때 호출
 * @param onChangeWeek 넘긴 주 수와 함께 호출 (다음 주면 양수, 이전 주면 음수)
 */
export function WeekDateStrip({ centerDate, selectedDate, onSelect, onChangeWeek }: Props) {
  const [width, setWidth] = useState(0);
  const pageRef = useRef(0);
  const onChangeWeekRef = useRef(onChangeWeek);

  useEffect(() => {
    onChangeWeekRef.current = onChangeWeek;
  });

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<number>[] }) => {
    const page = viewableItems[0]?.item;
    if (page === undefined || page === pageRef.current) return;
    onChangeWeekRef.current(page - pageRef.current);
    pageRef.current = page;
  }, []);

  return (
    <View className="w-full border-b border-neutral-600 pb-spacing-3" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <FlatList
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
          extraData={selectedDate}
          renderItem={({ item: page }) => (
            <Row style={{ width }}>
              {getWeekDates(addDays(centerDate, page * 7)).map((date, i) => {
                const textColor = isSameDay(date, selectedDate) ? "primary" : "disabled";
                return (
                  <Pressable key={i} onPress={() => onSelect(date)} className="flex-1 items-center py-spacing-3 rounded-radius-3">
                    <Stack gap="xs" align="center" className="items-center">
                      <Text variant="base-small" color={textColor}>{WEEKDAYS[date.getDay()]}</Text>
                      <Text variant="base-small" weight="medium" color={textColor}>{date.getDate()}</Text>
                    </Stack>
                  </Pressable>
                );
              })}
            </Row>
          )}
        />
      )}
    </View>
  );
}
