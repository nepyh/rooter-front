import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, View } from "react-native";
import Animated, { Easing, SlideInLeft, SlideInRight, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Text, Input, Button } from "@/components";
import { Icon } from "@/assets";
import { CATEGORY_COLORS } from "@/constants/category";
import type { Category } from "@/constants/category";
import { WEEKDAYS } from "@/constants/date";
import { buildMonthWeeks, isSameDay } from "@/utils/date";
import type { CalendarCellData } from "@/utils/date";
import { useNow } from "@/hooks/useNow";
import { getCalendarRange, createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "@/api/calendar";
import type { CalendarRange } from "@/api/calendar";

// ================================
// Types
// ================================

interface CalendarItem {
  id?: number; // 개인 일정만 있음(삭제 가능), 시험은 없음
  kind: "exam" | "event";
  label: string;
  memo: string;
  category: Category;
}

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const EMPTY_RANGE: CalendarRange = { days: [], exams: [], events: [] };

// 일정 추가·수정 실패 시 백엔드 code별 안내 문구
const EVENT_ERROR_MESSAGES: Record<string, string> = {
  "CALENDAR_004": "제목은 1~100자로 입력해주세요.",
  "CALENDAR_002": "날짜 형식이 올바르지 않아요.",
  "CALENDAR_EVENT_NOT_FOUND": "이미 삭제되었거나 찾을 수 없는 일정이에요.",
};

const getEventErrorMessage = (error: unknown, fallback: string) => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code : undefined;
  return EVENT_ERROR_MESSAGES[code] ?? fallback;
};

const buildItemsByDate = (range: CalendarRange): Record<string, CalendarItem[]> => {
  const map: Record<string, CalendarItem[]> = {};
  range.exams.forEach((exam) => {
    (map[exam.examDate] ??= []).push({ kind: "exam", label: exam.title, memo: `시험일 D-${exam.dDay}`, category: "neutral" });
  });
  range.events.forEach((event) => {
    (map[event.eventDate] ??= []).push({ id: event.id, kind: "event", label: event.title, memo: event.memo ?? "", category: "social" });
  });
  return map;
};

// ================================
// Components
// ================================

const SLIDE_MS = 260;
// 플랜보드 추가 시트와 같은 방식: 배경은 즉시 덮고, 시트만 화면 밖(아래)에서 위로 슬라이드시킵니다.
const DETAIL_SHEET_OFFSCREEN_Y = 700;

function CalendarCell({ cell, items, isToday, onSelectItem, onSelectDay }: {
  cell: CalendarCellData;
  items: CalendarItem[];
  isToday: boolean;
  onSelectItem: (date: Date, item: CalendarItem) => void;
  onSelectDay: (date: Date) => void;
}) {
  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
  const dimmed = !cell.inMonth || isWeekend;

  return (
    <Pressable onPress={() => onSelectDay(cell.date)} style={{ flex: 1, minHeight: 72 }} className="items-center px-xs py-m">
      <View style={{ height: 28 }} className="items-center justify-center">
        {isToday ? (
          <View className="items-center justify-center w-[28px] h-[28px] bg-primary-500 rounded-full">
            <Text variant="base-medium" color="primary">{cell.date.getDate()}</Text>
          </View>
        ) : (
          <Text variant="base-medium" color={dimmed ? "disabled" : "primary"}>{cell.date.getDate()}</Text>
        )}
      </View>
      {items.length > 0 && (
        <Stack gap="xxs" width="full" className="mt-s">
          {items.map((item, i) => (
            <Pressable key={i} onPress={() => onSelectItem(cell.date, item)}>
              <Row gap="xs" className="items-center rounded-xxs p-xs w-full" style={{ backgroundColor: CATEGORY_COLORS[item.category].bg }}>
                <View className="w-[2px] self-stretch rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category].bar }} />
                <Text variant="base-caption" color="primary" numberOfLines={1} style={{ flexShrink: 1 }}>{item.label}</Text>
              </Row>
            </Pressable>
          ))}
        </Stack>
      )}
    </Pressable>
  );
}

function PlanDetailModal({ visible, date, item, onClose, onHidden, onEdit, onDelete }: {
  visible: boolean;
  date: Date;
  item: CalendarItem;
  onClose: () => void;
  onHidden: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const translateY = useSharedValue(DETAIL_SHEET_OFFSCREEN_Y);
  // AddPlanBoardModal과 동일하게, 닫힘 애니메이션이 끝난 뒤에야 실제로 Modal을 내려주기 위한 렌더링 상태입니다.
  const [isRendered, setIsRendered] = useState(visible);

  const handleHidden = () => {
    setIsRendered(false);
    onHidden();
  };

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(DETAIL_SHEET_OFFSCREEN_Y, { duration: 400, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(handleHidden)();
      });
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={sheetStyle}>
            <Stack width="full" align="center" className="items-center bg-background-primary pt-s px-[28px] pb-[28px] rounded-t-[32px]" style={{ gap: 24 }}>
              <View className="w-[104px] h-[4px] rounded-full bg-neutral-600" style={{ alignSelf: "center" }} />
              <Stack gap="xxl" width="full" className="pb-xxl">
                <Stack gap="xs" width="full">
                  <Row gap="s">
                    <Text variant="base-medium" color="secondary">{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}</Text>
                    <Text variant="base-medium" color="secondary">|</Text>
                    <Text variant="base-medium" color="secondary">하루종일</Text>
                  </Row>
                  <Text variant="title-small">{item.label}</Text>
                </Stack>
                <Stack gap="s" width="full">
                  <Text variant="base-medium" weight="medium">메모</Text>
                  <View className="bg-neutral-700 p-m rounded-xs w-full" style={{ minHeight: 119 }}>
                    <Text variant="base-medium">{item.memo}</Text>
                  </View>
                </Stack>
                {item.kind === "event" && (
                  <Row gap="m" width="full">
                    <View className="flex-1">
                      <Button variant="disabled" disabled={false} onPress={onDelete}>삭제</Button>
                    </View>
                    <View className="flex-1">
                      <Button variant="primary" onPress={onEdit}>수정</Button>
                    </View>
                  </Row>
                )}
              </Stack>
            </Stack>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EventFormModal({ visible, date, initial, submitLabel, onClose, onSubmit }: {
  visible: boolean;
  date: Date | null;
  initial?: { title: string; memo: string };
  submitLabel: string;
  onClose: () => void;
  onSubmit: (title: string, memo: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setMemo(initial?.memo ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!date) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <Stack gap="l" className="bg-background-primary p-xl rounded-t-md">
          <Text variant="header-medium">{`${date.getMonth() + 1}월 ${date.getDate()}일 일정 ${submitLabel}`}</Text>
          <Input label="제목" value={title} onChangeText={setTitle} />
          <Input label="메모" value={memo} onChangeText={setMemo} multiline style={{ height: 80, textAlignVertical: "top" }} />
          <Row gap="m" width="full">
            <View className="flex-1">
              <Button variant="disabled" disabled={false} onPress={onClose}> 취소 </Button>
            </View>
            <View className="flex-1">
              <Button variant={title.trim() ? "primary" : "disabled"} onPress={() => onSubmit(title.trim(), memo.trim())}> {submitLabel} </Button>
            </View>
          </Row>
        </Stack>
      </View>
    </Modal>
  );
}

/**
 * 캘린더 화면
 */
export default function CalendarPage() {
  const now = useNow(60_000);
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [range, setRange] = useState<CalendarRange>(EMPTY_RANGE);
  const [activeItem, setActiveItem] = useState<{ date: Date; item: CalendarItem } | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [addingDate, setAddingDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<{ date: Date; item: CalendarItem } | null>(null);
  // iOS는 모달이 닫히는 중 다른 모달을 못 띄워서, 상세 시트가 완전히 내려간 뒤 수정 모달 열기
  const pendingEditRef = useRef<{ date: Date; item: CalendarItem } | null>(null);
  const hasNavigated = useRef(false);

  const weeks = buildMonthWeeks(viewDate.getFullYear(), viewDate.getMonth());
  const itemsByDate = useMemo(() => buildItemsByDate(range), [range]);

  const loadRange = useCallback(() => {
    const gridStart = weeks[0][0].date;
    const gridEnd = weeks[weeks.length - 1][6].date;
    getCalendarRange(toDateString(gridStart), toDateString(gridEnd))
      .then(setRange)
      .catch(() => setRange(EMPTY_RANGE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate]);

  useEffect(() => {
    loadRange();
  }, [loadRange]);

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

  const handleCreateEvent = async (title: string, memo: string) => {
    if (!addingDate || !title) return;
    try {
      await createCalendarEvent({ title, eventDate: toDateString(addingDate), memo: memo || undefined });
      setAddingDate(null);
      loadRange();
    } catch (error) {
      Alert.alert("추가 실패", getEventErrorMessage(error, "일정 추가에 실패했습니다. 잠시 후 다시 시도해주세요."));
    }
  };

  const handleStartEdit = () => {
    if (!activeItem) return;
    pendingEditRef.current = activeItem;
    setDetailVisible(false);
  };

  const handleDetailHidden = () => {
    if (!pendingEditRef.current) return;
    setEditingItem(pendingEditRef.current);
    pendingEditRef.current = null;
  };

  const handleUpdateEvent = async (title: string, memo: string) => {
    if (!editingItem?.item.id || !title) return;
    try {
      await updateCalendarEvent(editingItem.item.id, { title, memo });
      setEditingItem(null);
      loadRange();
    } catch (error) {
      Alert.alert("수정 실패", getEventErrorMessage(error, "일정 수정에 실패했습니다. 잠시 후 다시 시도해주세요."));
    }
  };

  const handleDeleteEvent = async () => {
    if (!activeItem?.item.id) return;
    try {
      await deleteCalendarEvent(activeItem.item.id);
      setDetailVisible(false);
      loadRange();
    } catch {
      Alert.alert("삭제 실패", "일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

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
                    items={itemsByDate[toDateString(cell.date)] ?? []}
                    isToday={isSameDay(cell.date, now)}
                    onSelectItem={(date, item) => { setActiveItem({ date, item }); setDetailVisible(true); }}
                    onSelectDay={(date) => setAddingDate(date)}
                  />
                ))}
              </Row>
            ))}
          </Stack>
        </Animated.View>
      </View>

      {activeItem && (
        <PlanDetailModal
          visible={detailVisible}
          date={activeItem.date}
          item={activeItem.item}
          onClose={() => setDetailVisible(false)}
          onHidden={handleDetailHidden}
          onEdit={handleStartEdit}
          onDelete={handleDeleteEvent}
        />
      )}

      <EventFormModal
        visible={addingDate !== null}
        date={addingDate}
        submitLabel="추가"
        onClose={() => setAddingDate(null)}
        onSubmit={handleCreateEvent}
      />

      <EventFormModal
        visible={editingItem !== null}
        date={editingItem?.date ?? null}
        initial={editingItem ? { title: editingItem.item.label, memo: editingItem.item.memo } : undefined}
        submitLabel="수정"
        onClose={() => setEditingItem(null)}
        onSubmit={handleUpdateEvent}
      />
    </View>
  );
}
