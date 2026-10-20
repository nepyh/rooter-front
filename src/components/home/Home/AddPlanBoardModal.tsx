import { useEffect, useState } from "react";
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Stack, Row } from "@/components/layout";
import { Text, Input, Switch, Button } from "@/components/ui";
import { Icon } from "@/assets";
import { TextbookPicker } from "./TextbookPicker";
import { ChapterPicker } from "./ChapterPicker";
import { TimeWheelPicker } from "../../common/TimeWheelPicker";
import type { TextbookWithSubject } from "./TextbookPicker";
import { color } from "@/constants/token/color";
import { createPlanTask, getOrCreateCurrentPlanBoard } from "@/api/common/planBoard";
import { buildMonthWeeks, isSameDay } from "@/utils/common/date";
import { WEEKDAYS } from "@/constants/date";
import { getSpacing } from "@/utils/common/token";

// ================================
// Types
// ================================

type PickerTarget = "start-date" | "start-time" | "end-date" | "end-time";

interface Props {
  visible: boolean;
  baseDate: Date;
  onClose: () => void;
  onCreated: () => void;
}

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const formatDatePill = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;
const formatTimePill = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const roundToNextHour = (base: Date) => {
  const date = new Date(base);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
};

const mergeDatePart = (base: Date, datePart: Date) => {
  const next = new Date(base);
  next.setFullYear(datePart.getFullYear(), datePart.getMonth(), datePart.getDate());
  return next;
};

const mergeTimePart = (base: Date, timePart: Date) => {
  const next = new Date(base);
  next.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return next;
};

const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.9);

// ================================
// Components
// ================================

function DatePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-600 px-spacing-4 py-spacing-3 rounded-radius-full">
      <Text variant="base-small" weight={active ? "medium" : "regular"} style={{ color: active ? "#F6482D" : "#FFFFFF" }}>{label}</Text>
    </Pressable>
  );
}

function CalendarGrid({ value, onSelect }: { value: Date; onSelect: (date: Date) => void }) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const weeks = buildMonthWeeks(viewYear, viewMonth);

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); } else setViewMonth((m) => m + 1);
  };

  return (
    <Stack gap="m" width="full">
      <Row width="full" align="between" className="items-center">
        <Pressable onPress={goPrevMonth} className="w-spacing-7 h-spacing-7 items-center justify-center">
          <Icon name="chevronLeft" size={20} />
        </Pressable>
        <Text variant="base-large" weight="medium" className="text-text-primary">{viewMonth + 1}월</Text>
        <Pressable onPress={goNextMonth} className="w-spacing-7 h-spacing-7 items-center justify-center">
          <Icon name="chevronRight" size={20} />
        </Pressable>
      </Row>
      <Stack gap="s" width="full">
        <Row width="full" className="justify-between">
          {WEEKDAYS.map((weekday) => (
            <View key={weekday} className="w-[32px] h-[32px] items-center justify-center">
              <Text variant="base-medium" color="secondary">{weekday}</Text>
            </View>
          ))}
        </Row>
        {weeks.map((week, i) => (
          <Row key={i} width="full" className="justify-between">
            {week.map((cell, j) => {
              const isSelected = isSameDay(cell.date, value);
              return (
                <Pressable
                  key={j}
                  onPress={() => onSelect(cell.date)}
                  className="w-[32px] h-[32px] rounded-radius-full items-center justify-center"
                  style={isSelected ? { backgroundColor: "#F6482D" } : undefined}
                >
                  <Text variant="base-medium" weight="medium" color={cell.inMonth || isSelected ? "primary" : "disabled"}>
                    {cell.date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * 플랜보드 추가 모달
 * @param visible 모달 표시 여부를 설정합니다.
 * @param baseDate 모달을 열 때 기준이 되는 날짜/시간을 입력합니다.
 * @param onClose 모달을 닫을 때 실행할 행동을 입력합니다.
 * @param onCreated 일정이 생성된 뒤 실행할 행동을 입력합니다.
 */
export function AddPlanBoardModal({ visible, baseDate, onClose, onCreated }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 400, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(setIsRendered)(false);
      });
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState(() => roundToNextHour(baseDate));
  const [end, setEnd] = useState(() => new Date(roundToNextHour(baseDate).getTime() + 60 * 60_000));
  const [activePicker, setActivePicker] = useState<PickerTarget | null>(null);

  const [selectedTextbooks, setSelectedTextbooks] = useState<Map<number, TextbookWithSubject>>(new Map());
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<number>>(new Set());
  const [showTextbookPicker, setShowTextbookPicker] = useState(false);
  const [chapterTextbook, setChapterTextbook] = useState<TextbookWithSubject | null>(null);
  const [pendingChapterIds, setPendingChapterIds] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const s = roundToNextHour(baseDate);
    setTitle("");
    setAllDay(false);
    setStart(s);
    setEnd(new Date(s.getTime() + 60 * 60_000));
    setSelectedTextbooks(new Map());
    setSelectedChapterIds(new Set());
    setShowTextbookPicker(false);
    setChapterTextbook(null);
    setError("");
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSubmit = title.trim().length > 0 && selectedTextbooks.size > 0 && selectedChapterIds.size > 0 && !submitting;

  const applyPicked = (target: PickerTarget, picked: Date) => {
    const setter = target.startsWith("start") ? setStart : setEnd;
    const merge = target.endsWith("date") ? mergeDatePart : mergeTimePart;
    setter((prev) => merge(prev, picked));
  };

  const togglePicker = (target: PickerTarget) => {
    Keyboard.dismiss();
    setActivePicker((prev) => (prev === target ? null : target));
  };

  const selectDate = (target: PickerTarget, date: Date) => {
    applyPicked(target, date);
    setTimeout(() => setActivePicker((prev) => (prev === target ? null : prev)), 500);
  };

  const openChapters = (textbook: TextbookWithSubject) => {
    setPendingChapterIds(selectedTextbooks.has(textbook.id) ? new Set(selectedChapterIds) : new Set());
    setChapterTextbook(textbook);
  };

  const togglePendingChapter = (id: number) => {
    setPendingChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const confirmChapters = () => {
    if (!chapterTextbook || pendingChapterIds.size === 0) return;
    setSelectedTextbooks(new Map([[chapterTextbook.id, chapterTextbook]]));
    setSelectedChapterIds(pendingChapterIds);
    setChapterTextbook(null);
    setShowTextbookPicker(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    let startAt = start;
    let endAt = end;
    if (allDay) {
      startAt = new Date(start);
      startAt.setHours(0, 0, 0, 0);
      endAt = new Date(start);
      endAt.setHours(23, 59, 0, 0);
    } else if (endAt <= startAt) {
      endAt = new Date(endAt.getTime() + 24 * 60 * 60_000);
    }

    setError("");
    setSubmitting(true);
    try {
      const board = await getOrCreateCurrentPlanBoard();
      const estimatedMinutes = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60_000));
      await createPlanTask({
        planBoardId: board.id,
        planDate: toDateString(startAt),
        taskName: title.trim(),
        startTime: formatTimePill(startAt),
        endTime: formatTimePill(endAt),
        estimatedMinutes,
      });
      onCreated();
    } catch {
      setError("일정 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-spacing-0 bg-neutral-1000/40" onPress={onClose} />
        <Animated.View style={[{ height: SHEET_HEIGHT, width: "100%" }, sheetStyle]}>
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Stack gap="xxl" width="full" className="bg-background-primary p-spacing-7 rounded-t-radius-6 flex-1">
              <Row width="full" align="between" className="items-center">
              <Pressable onPress={onClose} className="w-spacing-9 h-spacing-9 items-center justify-center">
                <Icon name="close" size={24} />
              </Pressable>
              <Text variant="header-medium" weight="semibold">새로운 일정</Text>
              <Pressable onPress={handleSubmit} disabled={!canSubmit} className="w-spacing-9 h-spacing-9 items-center justify-center">
                <Icon name="check" size={24} color={canSubmit ? "#FFFFFF" : "#525866"} />
              </Pressable>
            </Row>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ paddingBottom: getSpacing("spacing-11") }}
              {...({ delaysContentTouches: false } as object)}
            >
              <Stack gap="xl" width="full">
                <Stack gap="s" width="full">
                  <Text variant="base-medium">제목</Text>
                  <Input value={title} onChangeText={setTitle} placeholder="제목" />
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium">일시</Text>
                  <View className="w-full rounded-radius-4 overflow-hidden">
                    <Row width="full" align="between" className={`items-center bg-neutral-700 px-spacing-6 py-spacing-5 ${allDay ? "" : "border-b-2 border-neutral-600"}`}>
                      <Text variant="base-large" weight="medium" className="text-text-primary">하루종일</Text>
                      <Switch value={allDay} onToggle={() => setAllDay((prev) => !prev)} />
                    </Row>

                    {!allDay && (
                      <View className="w-full bg-neutral-700 px-spacing-6 py-spacing-5 border-b-2 border-neutral-600" style={{ gap: getSpacing("spacing-7") }}>
                        <Row width="full" align="between" className="items-center">
                          <Text variant="base-large" weight="medium" className="text-text-primary">시작</Text>
                          <Row gap="xs">
                            <DatePill label={formatDatePill(start)} active={activePicker === "start-date"} onPress={() => togglePicker("start-date")} />
                            <DatePill label={formatTimePill(start)} active={activePicker === "start-time"} onPress={() => togglePicker("start-time")} />
                          </Row>
                        </Row>
                        {activePicker === "start-date" && (
                          <CalendarGrid value={start} onSelect={(date) => selectDate("start-date", date)} />
                        )}
                        {activePicker === "start-time" && (
                          <TimeWheelPicker value={start} onChange={(date) => applyPicked("start-time", date)} />
                        )}
                      </View>
                    )}

                    {!allDay && (
                      <View className="w-full bg-neutral-700 px-spacing-6 py-spacing-5" style={{ gap: getSpacing("spacing-7") }}>
                        <Row width="full" align="between" className="items-center">
                          <Text variant="base-large" weight="medium" className="text-text-primary">종료</Text>
                          <Row gap="xs">
                            <DatePill label={formatDatePill(end)} active={activePicker === "end-date"} onPress={() => togglePicker("end-date")} />
                            <DatePill label={formatTimePill(end)} active={activePicker === "end-time"} onPress={() => togglePicker("end-time")} />
                          </Row>
                        </Row>
                        {activePicker === "end-date" && (
                          <CalendarGrid value={end} onSelect={(date) => selectDate("end-date", date)} />
                        )}
                        {activePicker === "end-time" && (
                          <TimeWheelPicker value={end} onChange={(date) => applyPicked("end-time", date)} />
                        )}
                      </View>
                    )}
                  </View>
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium">교과서</Text>
                  <Row gap="xl" className="flex-wrap">
                    {[...selectedTextbooks.values()].map((textbook) => (
                      <Pressable key={textbook.id} onPress={() => setShowTextbookPicker(true)} className="gap-spacing-3 w-[104px]">
                        <View className="w-[104px] h-[134px] rounded-radius-1 bg-neutral-700 items-center justify-center overflow-hidden">
                          {textbook.coverImageUrl ? (
                            <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                          ) : (
                            <Icon name="book" size={32} color={color.neutral["400"]} />
                          )}
                        </View>
                        <Stack gap="xxs">
                          <Text variant="base-small" weight="medium" className="text-text-primary" numberOfLines={1}>{textbook.title.replace(/\s*\([^)]+\)\s*$/, "")}</Text>
                          <Text variant="base-small" color="secondary" numberOfLines={1}>{textbook.publisherName ?? textbook.subjectName}</Text>
                          <Text variant="base-small" color="secondary" numberOfLines={1}>{`목차 ${selectedChapterIds.size}개`}</Text>
                        </Stack>
                      </Pressable>
                    ))}
                    <Pressable onPress={() => setShowTextbookPicker(true)} className="gap-spacing-3 w-[104px]">
                      <View className="w-[104px] h-[134px] rounded-radius-1 bg-neutral-700 border-2 border-dashed border-neutral-600 items-center justify-center">
                        <Icon name="plus" size={24} color={color.neutral["400"]} />
                      </View>
                      <Text variant="base-small" color="secondary">교과서 {selectedTextbooks.size > 0 ? "변경하기" : "추가하기"}</Text>
                    </Pressable>
                  </Row>
                </Stack>

                {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}
              </Stack>
            </ScrollView>
          </Stack>
            </KeyboardAvoidingView>
        </Animated.View>
      </View>

      {showTextbookPicker && (
        <View className="absolute inset-spacing-0 bg-background-primary px-spacing-7" style={{ paddingTop: insets.top + getSpacing("spacing-5") }}>
          <Row width="full" align="between" className="items-center pb-spacing-6">
            <Row gap="xs" className="items-center">
              <Pressable onPress={() => setShowTextbookPicker(false)} hitSlop={8}>
                <Icon name="chevronLeft" size={32} />
              </Pressable>
              <Text variant="header-medium" weight="semibold">교과서 선택</Text>
            </Row>
          </Row>
          <TextbookPicker selectedIds={new Set(selectedTextbooks.keys())} onToggle={openChapters} bottomInset={insets.bottom + 40} />
          <View
            pointerEvents="none"
            className="absolute left-spacing-0 right-spacing-0 bottom-spacing-0"
            style={{ height: 140, experimental_backgroundImage: `linear-gradient(180deg, ${color.background.primary}00 0%, ${color.background.primary} 100%)` }}
          />
        </View>
      )}

      {chapterTextbook && (
        <View className="absolute inset-spacing-0 bg-background-primary px-spacing-7" style={{ paddingTop: insets.top + getSpacing("spacing-5"), paddingBottom: insets.bottom + getSpacing("spacing-5") }}>
          <Row width="full" align="between" className="items-center pb-spacing-6">
            <Row gap="xs" className="items-center">
              <Pressable onPress={() => setChapterTextbook(null)} hitSlop={8}>
                <Icon name="chevronLeft" size={32} />
              </Pressable>
              <Text variant="header-medium" weight="semibold">목차 선택</Text>
            </Row>
            <Text variant="base-medium" weight="medium">{`${pendingChapterIds.size}개 선택됨`}</Text>
          </Row>
          <ChapterPicker textbookId={chapterTextbook.id} selectedIds={pendingChapterIds} onToggle={togglePendingChapter} bottomInset={24} />
          <Button variant={pendingChapterIds.size > 0 ? "primary" : "disabled"} onPress={confirmChapters}>선택 완료</Button>
        </View>
      )}
    </Modal>
  );
}
