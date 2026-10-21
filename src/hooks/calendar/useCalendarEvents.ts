import { Alert } from "react-native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarItemsByDate,
  getEventErrorMessage,
  updateCalendarEvent,
  type CalendarItemsByDate,
} from "@/api/calendar/Calendar";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useRefetchOnFocus } from "@/hooks/common/useRefetchOnFocus";
import { toLocalDateString } from "@/utils/common/date";

// ================================
// Constants
// ================================

const EMPTY_ITEMS: CalendarItemsByDate = {};

// ================================
// Hooks
// ================================

/**
 * useCalendarEvents — 캘린더에 보이는 기간의 시험·개인 일정 조회와 개인 일정 추가·수정·삭제
 * 캐시에 있으면 바로 보여주고, 화면에 다시 들어왔을 때 캐시가 오래됐으면 다시 불러옵니다.
 * 추가·수정·삭제에 성공하면 캘린더 캐시를 무효화해 다시 불러오고, 실패하면 안내 Alert 를 띄웁니다.
 * @param startKey 조회 시작일 (yyyy-MM-dd), 달력 첫 칸
 * @param endKey 조회 종료일 (yyyy-MM-dd), 달력 마지막 칸
 * @returns itemsByDate, createEvent, updateEvent, deleteEvent (세 함수 모두 성공 여부를 돌려줌)
 */
export function useCalendarEvents(startKey: string, endKey: string) {
  const itemsQuery = useQuery({
    queryKey: queryKeys.calendar.range(startKey, endKey),
    queryFn: () => getCalendarItemsByDate(startKey, endKey),
    placeholderData: keepPreviousData,
  });

  useRefetchOnFocus([queryKeys.calendar.range(startKey, endKey)]);

  const itemsByDate = (itemsQuery.isError ? null : itemsQuery.data) ?? EMPTY_ITEMS;

  const reload = () => queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });

  const createEvent = async (date: Date, title: string, memo: string) => {
    try {
      await createCalendarEvent({ title, eventDate: toLocalDateString(date), memo: memo || undefined });
      reload();
      return true;
    } catch (error) {
      Alert.alert("추가 실패", getEventErrorMessage(error, "일정 추가에 실패했습니다. 잠시 후 다시 시도해주세요."));
      return false;
    }
  };

  const updateEvent = async (id: number, title: string, memo: string) => {
    try {
      await updateCalendarEvent(id, { title, memo });
      reload();
      return true;
    } catch (error) {
      Alert.alert("수정 실패", getEventErrorMessage(error, "일정 수정에 실패했습니다. 잠시 후 다시 시도해주세요."));
      return false;
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await deleteCalendarEvent(id);
      reload();
      return true;
    } catch {
      Alert.alert("삭제 실패", "일정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return false;
    }
  };

  return { itemsByDate, createEvent, updateEvent, deleteEvent };
}
