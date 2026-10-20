import { useRef, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CalendarHeader, WeekdayHeader, MonthGrid, PlanDetailModal, EventFormModal } from "@/components";
import type { CalendarItem } from "@/api/calendar/Calendar";
import { useNow } from "@/hooks/useNow";
import { useCalendarMonth } from "@/hooks/calendar/useCalendarMonth";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";

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
 */
export default function CalendarPage() {
  const now = useNow(60_000);
  const month = useCalendarMonth(now);
  const { itemsByDate, createEvent, updateEvent, deleteEvent } = useCalendarEvents(month.gridStartKey, month.gridEndKey);

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
    <View className="flex-1">
      <StatusBar style="light" />
      <CalendarHeader title={month.headerText} onPrev={month.goPrevMonth} onNext={month.goNextMonth} />
      <WeekdayHeader />
      <MonthGrid
        monthKey={`${month.viewDate.getFullYear()}-${month.viewDate.getMonth()}`}
        weeks={month.weeks}
        itemsByDate={itemsByDate}
        today={now}
        animate={month.hasNavigated}
        direction={month.direction}
        onSelectItem={handleSelectItem}
        onSelectDay={setAddingDate}
      />

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
