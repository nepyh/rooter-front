import { useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView } from "react-native";
import { Text } from "../../ui/Text";
import { WHEEL_HEIGHT, WHEEL_ITEM_HEIGHT, WHEEL_PADDING_ROWS } from "./wheel";

// ================================
// Components
// ================================

interface Props {
  data: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}

/**
 * 위아래로 굴려 값을 고르는 휠 한 줄
 * @param data 보여줄 값 목록
 * @param selectedIndex 고른 값의 위치
 * @param onChange 값이 바뀔 때 호출
 * @param width 휠 너비
 */
export function WheelColumn({ data, selectedIndex, onChange, width = 64 }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const selectRow = (row: number) => {
    const index = Math.max(0, Math.min(data.length - 1, row));
    scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated: true });
    onChange(index);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    selectRow(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, width }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      onScrollEndDrag={handleScrollEnd}
      onMomentumScrollEnd={handleScrollEnd}
      onLayout={() => scrollRef.current?.scrollTo({ y: selectedIndex * WHEEL_ITEM_HEIGHT, animated: false })}
      contentContainerStyle={{ paddingVertical: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS }}
    >
      {data.map((label, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable key={label} onPress={() => selectRow(index)} style={{ height: WHEEL_ITEM_HEIGHT }} className="items-center justify-center">
            <Text variant="base-large" weight={isSelected ? "medium" : "regular"} color={isSelected ? "primary" : "disabled"}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
