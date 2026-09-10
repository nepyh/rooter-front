import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { Easing, SlideInLeft, SlideInRight, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { buildMonthWeeks, isSameDay } from "@/utils/date";
import type { CalendarCellData } from "@/utils/date";
import { useNow } from "@/hooks/useNow";

// ================================
// Types
// ================================

interface CalendarEvent {
  label: string;
  category: Category;
  memo: string;
}

// ================================
// Helpers
// ================================

const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const buildMockEvents = (reference: Date): Record<string, CalendarEvent[]> => {
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const makeDay = (day: number) => new Date(reference.getFullYear(), reference.getMonth(), day);

  return {
    [dateKey(today)]: [
      { label: "기말고사", category: "neutral", memo: "마지막 시험, 끝나면 바로 놀러가기" },
      { label: "두줄", category: "social", memo: "두줄 약속 장소는 학교 앞 카페" },
    ],
    [dateKey(makeDay(3))]: [{ label: "수학 학원", category: "math", memo: "숙제 다 풀고 가기" }],
    [dateKey(makeDay(6))]: [{ label: "체육대회", category: "social", memo: "물, 모자 챙기기" }],
    [dateKey(makeDay(8))]: [{ label: "영어 단어시험", category: "english", memo: "단어장 3단원까지 외우기" }],
    [dateKey(makeDay(13))]: [{ label: "방학식", category: "neutral", memo: "방학식 빨리 오너라" }],
    [dateKey(makeDay(19))]: [{ label: "과학 실험", category: "science", memo: "보호 안경 챙기기" }],
    [dateKey(makeDay(24))]: [
      { label: "동아리 모임", category: "social", memo: "회비 걷는 날, 만원 챙기기" },
      { label: "사회 발표", category: "social", memo: "발표 자료 최종 점검" },
    ],
  };
};

// ================================
// Components
// ================================

const SLIDE_MS = 260;
// 플랜보드 추가 시트와 같은 방식: 배경은 즉시 덮고, 시트만 화면 밖(아래)에서 위로 슬라이드시킵니다.
const DETAIL_SHEET_OFFSCREEN_Y = 700;

function CalendarCell({ cell, events, isToday, onSelectEvent }: {
  cell: CalendarCellData;
  events: CalendarEvent[];
  isToday: boolean;
  onSelectEvent: (date: Date, event: CalendarEvent) => void;
}) {
  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
  const dimmed = !cell.inMonth || isWeekend;

  return (
    <View style={{ flex: 1, minHeight: 72 }} className="items-center px-xs py-m">
      <View style={{ height: 28 }} className="items-center justify-center">
        {isToday ? (
          <View className="items-center justify-center w-[28px] h-[28px] bg-primary-500 rounded-full">
            <Text variant="base-medium" color="primary">{cell.date.getDate()}</Text>
          </View>
        ) : (
          <Text variant="base-medium" color={dimmed ? "disabled" : "primary"}>{cell.date.getDate()}</Text>
        )}
      </View>
      {events.length > 0 && (
        <Stack gap="xxs" width="full" className="mt-s">
          {events.map((event, i) => (
            <Pressable key={i} onPress={() => onSelectEvent(cell.date, event)}>
              <Row gap="xs" className="items-center rounded-xxs p-xs w-full" style={{ backgroundColor: CATEGORY_COLORS[event.category].bg }}>
                <View className="w-[2px] self-stretch rounded-full" style={{ backgroundColor: CATEGORY_COLORS[event.category].bar }} />
                <Text variant="base-caption" color="primary" numberOfLines={1} style={{ flexShrink: 1 }}>{event.label}</Text>
              </Row>
            </Pressable>
          ))}
        </Stack>
      )}
    </View>
  );
}

function PlanDetailModal({ visible, date, event, onClose }: { visible: boolean; date: Date; event: CalendarEvent; onClose: () => void }) {
  const translateY = useSharedValue(DETAIL_SHEET_OFFSCREEN_Y);
  // AddPlanBoardModal과 동일하게, 닫힘 애니메이션이 끝난 뒤에야 실제로 Modal을 내려주기 위한 렌더링 상태입니다.
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(DETAIL_SHEET_OFFSCREEN_Y, { duration: 400, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setIsRendered)(false);
      });
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={sheetStyle}>
            <Stack gap="xxl" width="full" align="center" className="items-center bg-background-primary pt-s px-xxl pb-xxl rounded-t-[32px]">
              <View className="w-[104px] h-[4px] rounded-full bg-neutral-600" style={{ alignSelf: "center" }} />
              <Stack gap="xxl" width="full" className="pb-xxl">
                <Stack gap="xs" width="full">
                  <Row gap="s">
                    <Text variant="base-medium" color="secondary">{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}</Text>
                    <Text variant="base-medium" color="secondary">|</Text>
                    <Text variant="base-medium" color="secondary">하루종일</Text>
                  </Row>
                  <Text variant="title-small">{event.label}</Text>
                </Stack>
                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">메모</Text>
                  <View className="bg-neutral-700 p-m rounded-xs w-full" style={{ minHeight: 119 }}>
                    <Text variant="base-medium">{event.memo}</Text>
                  </View>
                </Stack>
              </Stack>
            </Stack>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * 캘린더 화면
 * @description 월별 달력으로 일정을 보여주고, 월을 이동할 수 있습니다. 표시되는 날짜는 항상 오늘 기준입니다.
 */
export default function CalendarPage() {
  const now = useNow(60_000);
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [activePlan, setActivePlan] = useState<{ date: Date; event: CalendarEvent } | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const hasNavigated = useRef(false);
  const events = buildMockEvents(now);

  const weeks = buildMonthWeeks(viewDate.getFullYear(), viewDate.getMonth());

  const goPrevMonth = () => {
    hasNavigated.current = true;
    setDirection("prev");
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    hasNavigated.current = true;
    setDirection("next");
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const isViewingCurrentMonth = viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth();
  const headerText = isViewingCurrentMonth
    ? `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월 ${now.getDate()}일`
    : `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" align="between" className="items-center pb-l">
        <Text variant="header-large">{headerText}</Text>
        <Row gap="xs" className="items-center">
          <Pressable onPress={goPrevMonth} className="p-xs rounded-full">
            <Icon name="chevronLeft" size={24} />
          </Pressable>
          <Pressable onPress={goNextMonth} className="p-xs rounded-full">
            <Icon name="chevronRight" size={24} />
          </Pressable>
        </Row>
      </Row>

      <Row width="full" className="border-b border-neutral-600 pb-s">
        {WEEKDAYS.map((weekday, i) => (
          <View key={weekday} className="flex-1 items-center px-m py-s">
            <Text variant="base-medium" color={i === 0 || i === 6 ? "disabled" : "primary"}>{weekday}</Text>
          </View>
        ))}
      </Row>

      <View style={{ overflow: "hidden" }}>
        <Animated.View
          key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
          entering={hasNavigated.current ? (direction === "next" ? SlideInRight : SlideInLeft).duration(SLIDE_MS) : undefined}
        >
          <Stack width="full">
            {weeks.map((week, i) => (
              <Row key={i} width="full" className={i < weeks.length - 1 ? "border-b border-neutral-600" : ""}>
                {week.map((cell, j) => (
                  <CalendarCell
                    key={j}
                    cell={cell}
                    events={events[dateKey(cell.date)] ?? []}
                    isToday={isSameDay(cell.date, now)}
                    onSelectEvent={(date, event) => { setActivePlan({ date, event }); setDetailVisible(true); }}
                  />
                ))}
              </Row>
            ))}
          </Stack>
        </Animated.View>
      </View>

      {activePlan && (
        <PlanDetailModal
          visible={detailVisible}
          date={activePlan.date}
          event={activePlan.event}
          onClose={() => setDetailVisible(false)}
        />
      )}
    </View>
  );
}
