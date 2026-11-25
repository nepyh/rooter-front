import { useRef, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarHeader, WeekdayHeader, MonthGrid, PlanDetailModal, EventFormModal, NAV_BAR_HEIGHT } from "@/components";
import type { CalendarItem } from "@/api/calendar/Calendar";
import { useNow } from "@/hooks/common/useNow";
import { useCalendarMonth } from "@/hooks/calendar/useCalendarMonth";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { useMonthSwipe } from "@/hooks/common/useMonthSwipe";
import { usePlanBoards } from "@/hooks/home/usePlanBoards";
import { buildPendingGenerationItems, mergeItemsByDate } from "@/utils/home/planGeneration";

// ================================
// Types
// ================================

interface SelectedItem {
  date: Date;
  item: CalendarItem;
}

// ================================
// Components
// ================================

/**
 * 캘린더 화면
 * AI 계획을 아직 만드는 중이거나 만들지 못한 날은 "계획 만드는 중"·"계획 만들기 실패" 표시를 붙여 빈 날과 구분함 (rooter-back#405)
 */
export default function CalendarPage() {
  const insets = useSafeAreaInsets();
  const now = useNow(60_000);
  const month = useCalendarMonth(now);
  const { itemsByDate: eventsByDate, createEvent, updateEvent, deleteEvent } = useCalendarEvents(month.gridStartKey, month.gridEndKey);
  const { boards } = usePlanBoards();
  const itemsByDate = mergeItemsByDate(eventsByDate, buildPendingGenerationItems(boards, month.gridStartKey, month.gridEndKey));
  const monthKey = `${month.viewDate.getFullYear()}-${month.viewDate.getMonth()}`;
  const swipe = useMonthSwipe(monthKey, month.goPrevMonth, month.goNextMonth);

  const [activeItem, setActiveItem] = useState<SelectedItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [addingDate, setAddingDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<SelectedItem | null>(null);
  const pendingEditRef = useRef<SelectedItem | null>(null);

  const handleSelectItem = (date: Date, item: CalendarItem) => {
    setActiveItem({ date, item });
    setDetailVisible(true);
  };

  const handleCreateEvent = async (title: string, memo: string) => {
    if (!addingDate || !title) return;
    if (await createEvent(addingDate, title, memo)) setAddingDate(null);
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
    if (await updateEvent(editingItem.item.id, title, memo)) setEditingItem(null);
  };

  const handleDeleteEvent = async () => {
    if (!activeItem?.item.id) return;
    if (await deleteEvent(activeItem.item.id)) setDetailVisible(false);
  };

  return (
    // 탭바는 화면 위에 떠 있으므로 아래 안전 영역을 뺀 나머지 높이만큼 비워 날짜 칸이 탭바 바로 위에서 끝나게 함
    <View className="flex-1" style={{ paddingBottom: NAV_BAR_HEIGHT - insets.bottom }}>
      <StatusBar style="light" />
      <CalendarHeader title={month.headerText} onPrev={month.goPrevMonth} onNext={month.goNextMonth} />
      <WeekdayHeader />
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View style={[{ flex: 1 }, swipe.animatedStyle]} onLayout={swipe.onLayout}>
          <MonthGrid
            monthKey={monthKey}
            weeks={month.weeks}
            itemsByDate={itemsByDate}
            today={now}
            animate={month.hasNavigated}
            direction={month.direction}
            onSelectItem={handleSelectItem}
            onSelectDay={setAddingDate}
          />
        </Animated.View>
      </GestureDetector>

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
