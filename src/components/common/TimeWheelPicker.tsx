import { useEffect, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import { Text } from "../ui/Text";
import { color } from "@/constants/token/color";
import { pad } from "@/utils/common/time";

// ================================
// Constants
// ================================

const HOUR_LABELS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_LABELS = Array.from({ length: 60 }, (_, i) => pad(i));
const MERIDIEM_LABELS = ["AM", "PM"];

const WHEEL_ITEM_HEIGHT = 40;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;
const WHEEL_PADDING_ROWS = Math.floor(WHEEL_VISIBLE_ROWS / 2);
const WHEEL_LOOP_CYCLES = 7;
const SHEET_SLIDE_SETTLE_MS = 450;

// ================================
// Components
// ================================

interface WheelColumnProps {
  data: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  loop?: boolean;
}

/**
 * 위아래로 굴려 값을 고르는 휠 한 줄
 * loop 면 다이얼처럼 끝과 처음이 이어지도록 같은 값을 여러 바퀴 이어 붙이고, 멈추면 가운데 바퀴로 몰래 되돌림
 * 아래에서 올라오는 시트 안에서 쓰면 시트 애니메이션과 겹쳐 처음 위치가 씹힐 수 있어, 애니메이션이 끝난 뒤 한 번 더 맞춤
 * @param data 보여줄 값 목록
 * @param selectedIndex 고른 값의 위치
 * @param onChange 값이 바뀔 때 호출
 * @param loop 끝과 처음을 이어 계속 돌릴 수 있게 할지
 */
function WheelColumn({ data, selectedIndex, onChange, loop = false }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const cycles = loop ? WHEEL_LOOP_CYCLES : 1;
  const middleCycle = Math.floor(cycles / 2);
  const rowCount = data.length * cycles;

  const toRow = (index: number) => index + middleCycle * data.length;

  const scrollToRow = (row: number, animated = true) => {
    scrollRef.current?.scrollTo({ y: row * WHEEL_ITEM_HEIGHT, animated });
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToRow(toRow(selectedIndex), false), SHEET_SLIDE_SETTLE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectRow = (row: number) => {
    const clamped = Math.max(0, Math.min(rowCount - 1, row));
    const index = clamped % data.length;
    if (loop && Math.floor(clamped / data.length) !== middleCycle) scrollToRow(toRow(index), false);
    else scrollToRow(clamped);
    onChange(index);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    selectRow(Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT));
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, width: 64 }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      onScrollEndDrag={handleMomentumEnd}
      onMomentumScrollEnd={handleMomentumEnd}
      onLayout={() => scrollToRow(toRow(selectedIndex), false)}
      contentContainerStyle={{ paddingVertical: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS }}
    >
      {Array.from({ length: rowCount }, (_, row) => {
        const index = row % data.length;
        const isSelected = index === selectedIndex;
        return (
          <Pressable key={row} onPress={() => selectRow(row)} style={{ height: WHEEL_ITEM_HEIGHT }} className="items-center justify-center">
            <Text variant="base-large" weight={isSelected ? "medium" : "regular"} color={isSelected ? "primary" : "disabled"}>
              {data[index]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * 시·분·오전/오후 휠 세 줄로 시각을 고르는 피커
 * @param value 고른 시각 (날짜 부분은 그대로 둠)
 * @param onChange 시각이 바뀔 때 호출
 */
export function TimeWheelPicker({ value, onChange }: Props) {
  const hour24 = value.getHours();
  const meridiemIndex = hour24 >= 12 ? 1 : 0;
  const hour12 = ((hour24 + 11) % 12) + 1;
  const minute = value.getMinutes();

  const applyChange = (nextHour12: number, nextMinute: number, nextMeridiemIndex: number) => {
    const next = new Date(value);
    const hour = (nextHour12 % 12) + (nextMeridiemIndex === 1 ? 12 : 0);
    next.setHours(hour, nextMinute, 0, 0);
    onChange(next);
  };

  return (
    <View className="bg-neutral-800 rounded-radius-4 flex-row justify-center" style={{ height: WHEEL_HEIGHT }}>
      <View
        pointerEvents="none"
        className="absolute left-spacing-0 right-spacing-0 rounded-radius-3"
        style={{ top: WHEEL_ITEM_HEIGHT * WHEEL_PADDING_ROWS, height: WHEEL_ITEM_HEIGHT, backgroundColor: `${color.neutral["500"]}4D` }}
      />
      <WheelColumn data={HOUR_LABELS} selectedIndex={hour12 - 1} onChange={(i) => applyChange(i + 1, minute, meridiemIndex)} loop />
      <WheelColumn data={MINUTE_LABELS} selectedIndex={minute} onChange={(i) => applyChange(hour12, i, meridiemIndex)} loop />
      <WheelColumn data={MERIDIEM_LABELS} selectedIndex={meridiemIndex} onChange={(i) => applyChange(hour12, minute, i)} />
    </View>
  );
}
