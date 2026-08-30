import { useEffect, useRef, useState } from "react";
import { Dimensions, Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Stack, Row } from "@/components/layout";
import { Text, Input, Switch } from "@/components/ui";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject, getChaptersByTextbook } from "@/api/catalog";
import type { Subject, Textbook, Chapter } from "@/api/catalog";
import { createPlanBoard } from "@/api/planBoard";
import type { PlanBoard } from "@/api/planBoard";
import { buildMonthWeeks, isSameDay } from "@/utils/date";
import { WEEKDAYS } from "@/constants/date";

// ================================
// Types
// ================================

type PickerTarget = "start-date" | "start-time" | "end-date" | "end-time";

interface Props {
  visible: boolean;
  baseDate: Date;
  onClose: () => void;
  onCreated: (board: PlanBoard) => void;
}

// ================================
// Helpers
// ================================

const pad = (n: number) => String(n).padStart(2, "0");
const formatDatePill = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;
const formatTimePill = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const HOUR_LABELS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_LABELS = Array.from({ length: 60 }, (_, i) => pad(i));
const MERIDIEM_LABELS = ["AM", "PM"];

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

// "90%" 같은 퍼센트 값은 부모 체인에 명확한 높이가 없으면(여기서는 배경을 감싸는 Pressable이
// 그 경우) 제대로 해석되지 않아 시트가 내용물 크기로만 줄어들고 스크롤도 먹통이 됩니다.
// 화면 실측 높이로 직접 계산해 고정 픽셀 값을 써야 확실하게 동작합니다.
const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.9);

// 커스텀 시간 휠피커의 한 행 높이와, 화면에 동시에 보이는 행 수(가운데 1개 + 위아래 2개씩)입니다.
const WHEEL_ITEM_HEIGHT = 40;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

// ================================
// Components
// ================================

function DatePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-600 px-m py-s rounded-full">
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
        <Pressable onPress={goPrevMonth} className="w-6 h-6 items-center justify-center">
          <Icon name="chevronLeft" size={20} />
        </Pressable>
        <Text variant="base-large" weight="medium" className="text-white">{viewMonth + 1}월</Text>
        <Pressable onPress={goNextMonth} className="w-6 h-6 items-center justify-center">
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
                  className="w-[32px] h-[32px] rounded-full items-center justify-center"
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

function WheelColumn({ data, selectedIndex, onChange }: { data: string[]; selectedIndex: number; onChange: (index: number) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingRows = Math.floor(WHEEL_VISIBLE_ROWS / 2);

  const scrollToIndex = (index: number, animated = true) => {
    scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    scrollToIndex(clamped);
    onChange(clamped);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ height: WHEEL_HEIGHT, width: 64 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate="fast"
      onScrollEndDrag={handleMomentumEnd}
      onMomentumScrollEnd={handleMomentumEnd}
      // 상시 마운트된 상태라 display:none일 땐 레이아웃이 없다가, 처음 보이는 순간
      // onLayout이 뜹니다. useEffect보다 이 시점에 위치를 맞춰야 실제 레이아웃이
      // 잡히기 전에 scrollTo가 무시되는 문제가 없습니다.
      onLayout={() => scrollToIndex(selectedIndex, false)}
      contentContainerStyle={{ paddingVertical: WHEEL_ITEM_HEIGHT * paddingRows }}
    >
      {data.map((label, index) => (
        <Pressable
          key={label}
          onPress={() => { scrollToIndex(index); onChange(index); }}
          style={{ height: WHEEL_ITEM_HEIGHT }}
          className="items-center justify-center"
        >
          <Text
            variant="base-large"
            weight={index === selectedIndex ? "medium" : "regular"}
            color={index === selectedIndex ? "primary" : "disabled"}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function TimeWheelPicker({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
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
    <View className="bg-neutral-800 rounded-md flex-row justify-center" style={{ height: WHEEL_HEIGHT }}>
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 rounded-sm"
        style={{ top: WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2), height: WHEEL_ITEM_HEIGHT, backgroundColor: "rgba(107,114,128,0.3)" }}
      />
      <WheelColumn data={HOUR_LABELS} selectedIndex={hour12 - 1} onChange={(i) => applyChange(i + 1, minute, meridiemIndex)} />
      <WheelColumn data={MINUTE_LABELS} selectedIndex={minute} onChange={(i) => applyChange(hour12, i, meridiemIndex)} />
      <WheelColumn data={MERIDIEM_LABELS} selectedIndex={meridiemIndex} onChange={(i) => applyChange(hour12, minute, i)} />
    </View>
  );
}

function PickerRow<T extends { id: number; name: string }>({ label, options, selectedId, onSelect, emptyText }: {
  label: string;
  options: T[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  emptyText: string;
}) {
  return (
    <Stack gap="m">
      <Text variant="base-medium" weight="medium">{label}</Text>
      {options.length === 0 ? (
        <Text color="disabled">{emptyText}</Text>
      ) : (
        <Row gap="s" className="flex-wrap">
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.id)}
                className="px-l py-s rounded-full border-2"
                style={{
                  borderColor: isSelected ? "#F6482D" : "#525866",
                  backgroundColor: isSelected ? "rgba(246,72,45,0.15)" : "transparent",
                }}
              >
                <Text weight="medium" style={{ color: isSelected ? "#F6482D" : "#8A919E" }}>
                  {option.name}
                </Text>
              </Pressable>
            );
          })}
        </Row>
      )}
    </Stack>
  );
}

/**
 * 플랜보드 추가 모달
 * @description 홈 화면 위에 뜨는 바텀시트로, 제목/일시/교과서를 입력해 새로운 플랜보드를 만듭니다.
 */
export function AddPlanBoardModal({ visible, baseDate, onClose, onCreated }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  // Modal의 animationType이 "none"이라 visible이 false가 되는 즉시 네이티브 모달이 사라져서,
  // 우리 슬라이드다운 애니메이션이 재생될 틈이 없습니다. 그래서 닫힐 때는 애니메이션이 끝난
  // 뒤에야 실제로 Modal을 내려주기 위해 별도의 렌더링 상태를 둡니다.
  const [isRendered, setIsRendered] = useState(visible);

  // 배경(Backdrop)은 페이드 없이 즉시 덮고, 시트만 따로 아래에서 위로 슬라이드시킵니다.
  // (Modal 자체를 fade/slide로 움직이면 NavBar가 사라지는 시점과 배경이 그 자리를 덮는
  // 시점 사이에 화면이 잠깐 비어 보이는 틈이 생겨서 이렇게 분리했습니다.)
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

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [textbookId, setTextbookId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [textbookLabel, setTextbookLabel] = useState<{ subjectName: string; textbookName: string } | null>(null);
  const [showTextbookPicker, setShowTextbookPicker] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 모달을 새로 열 때마다 이전 입력을 초기화합니다. baseDate(현재 시각)는 여기서 스냅샷으로만
  // 쓰고 싶어서 의도적으로 의존성 배열에서 뺐습니다 — 안 그러면 홈 화면의 시계가 갱신될 때마다
  // (30초 간격) 모달이 열려있는 동안 입력 중이던 내용이 계속 초기화되어 버립니다.
  useEffect(() => {
    if (!visible) return;
    const s = roundToNextHour(baseDate);
    setTitle("");
    setAllDay(false);
    setStart(s);
    setEnd(new Date(s.getTime() + 60 * 60_000));
    setSubjectId(null);
    setTextbookId(null);
    setChapterId(null);
    setTextbookLabel(null);
    setShowTextbookPicker(false);
    setError("");
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    getSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, [visible]);

  useEffect(() => {
    setTextbookId(null);
    setChapters([]);
    if (subjectId === null) {
      setTextbooks([]);
      return;
    }
    getTextbooksBySubject(subjectId).then(setTextbooks).catch(() => setTextbooks([]));
  }, [subjectId]);

  useEffect(() => {
    setChapterId(null);
    if (textbookId === null) {
      setChapters([]);
      return;
    }
    getChaptersByTextbook(textbookId).then(setChapters).catch(() => setChapters([]));
  }, [textbookId]);

  const canSubmit = title.trim().length > 0 && subjectId !== null && textbookId !== null && chapterId !== null && !submitting;

  const applyPicked = (target: PickerTarget, picked: Date) => {
    const setter = target.startsWith("start") ? setStart : setEnd;
    const merge = target.endsWith("date") ? mergeDatePart : mergeTimePart;
    setter((prev) => merge(prev, picked));
  };

  const togglePicker = (target: PickerTarget) => {
    setActivePicker((prev) => (prev === target ? null : target));
  };

  // 선택한 날짜에 주황색 원이 들어오는 걸 잠깐 보여준 뒤 달력을 접습니다.
  const selectDate = (target: PickerTarget, date: Date) => {
    applyPicked(target, date);
    setTimeout(() => setActivePicker((prev) => (prev === target ? null : prev)), 500);
  };

  const handleConfirmTextbook = () => {
    if (subjectId === null || textbookId === null || chapterId === null) return;
    const subjectName = subjects.find((s) => s.id === subjectId)?.name ?? "";
    const textbookName = textbooks.find((t) => t.id === textbookId)?.name ?? "";
    setTextbookLabel({ subjectName, textbookName });
    setShowTextbookPicker(false);
  };

  const handleSubmit = async () => {
    if (!canSubmit || subjectId === null || textbookId === null || chapterId === null) return;

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
      const board = await createPlanBoard({
        title: title.trim(),
        subjectId,
        textbookId,
        chapterId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });
      onCreated(board);
    } catch {
      setError("플랜보드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="none" visible={isRendered} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Animated.View style={[{ height: SHEET_HEIGHT, width: "100%" }, sheetStyle]}>
            <Stack gap="xxl" width="full" className="bg-background-primary p-6 rounded-t-[32px] flex-1">
              <Row width="full" align="between" className="items-center">
              <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
                <Icon name="close" size={24} />
              </Pressable>
              <Text variant="header-medium" weight="semibold">새로운 일정</Text>
              <Pressable onPress={handleSubmit} disabled={!canSubmit} className="w-8 h-8 items-center justify-center">
                <Icon name="check" size={24} color={canSubmit ? "#FFFFFF" : "#525866"} />
              </Pressable>
            </Row>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              scrollEnabled={activePicker === null}
              {...({ delaysContentTouches: false } as object)}
            >
              <Stack gap="xl" width="full">
                <Stack gap="s" width="full">
                  <Text variant="base-medium">제목</Text>
                  <Input value={title} onChangeText={setTitle} placeholder="제목" />
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium">일시</Text>
                  <View className="w-full rounded-md overflow-hidden">
                    <Row width="full" align="between" className={`items-center bg-neutral-700 px-xl py-[18px] ${allDay ? "" : "border-b-2 border-neutral-600"}`}>
                      <Text variant="base-large" weight="medium" className="text-white">하루종일</Text>
                      <Switch value={allDay} onToggle={() => setAllDay((prev) => !prev)} />
                    </Row>

                    {!allDay && (
                      <View className="w-full bg-neutral-700 px-xl py-[16px] border-b-2 border-neutral-600" style={{ gap: 24 }}>
                        <Row width="full" align="between" className="items-center">
                          <Text variant="base-large" weight="medium" className="text-white">시작</Text>
                          <Row gap="xs">
                            <DatePill label={formatDatePill(start)} active={activePicker === "start-date"} onPress={() => togglePicker("start-date")} />
                            <DatePill label={formatTimePill(start)} active={activePicker === "start-time"} onPress={() => togglePicker("start-time")} />
                          </Row>
                        </Row>
                        {activePicker === "start-date" && (
                          <CalendarGrid value={start} onSelect={(date) => selectDate("start-date", date)} />
                        )}
                        <View style={{ display: activePicker === "start-time" ? "flex" : "none" }}>
                          <TimeWheelPicker value={start} onChange={(date) => applyPicked("start-time", date)} />
                        </View>
                      </View>
                    )}

                    {!allDay && (
                      <View className="w-full bg-neutral-700 px-xl py-[16px]" style={{ gap: 24 }}>
                        <Row width="full" align="between" className="items-center">
                          <Text variant="base-large" weight="medium" className="text-white">종료</Text>
                          <Row gap="xs">
                            <DatePill label={formatDatePill(end)} active={activePicker === "end-date"} onPress={() => togglePicker("end-date")} />
                            <DatePill label={formatTimePill(end)} active={activePicker === "end-time"} onPress={() => togglePicker("end-time")} />
                          </Row>
                        </Row>
                        {activePicker === "end-date" && (
                          <CalendarGrid value={end} onSelect={(date) => selectDate("end-date", date)} />
                        )}
                        <View style={{ display: activePicker === "end-time" ? "flex" : "none" }}>
                          <TimeWheelPicker value={end} onChange={(date) => applyPicked("end-time", date)} />
                        </View>
                      </View>
                    )}
                  </View>
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium">교과서</Text>
                  {showTextbookPicker ? (
                    <Stack gap="xl" width="full" className="bg-neutral-700 p-l rounded-md">
                      <PickerRow label="과목" options={subjects} selectedId={subjectId} onSelect={setSubjectId} emptyText="과목을 불러오는 중입니다." />
                      {subjectId !== null && (
                        <PickerRow label="교과서" options={textbooks} selectedId={textbookId} onSelect={setTextbookId} emptyText="교과서를 불러오는 중입니다." />
                      )}
                      {textbookId !== null && (
                        <PickerRow label="단원" options={chapters} selectedId={chapterId} onSelect={setChapterId} emptyText="단원을 불러오는 중입니다." />
                      )}
                      <Pressable
                        onPress={handleConfirmTextbook}
                        disabled={chapterId === null}
                        className="py-m rounded-sm items-center justify-center"
                        style={{ backgroundColor: chapterId === null ? "#525866" : "#F6482D" }}
                      >
                        <Text variant="base-medium" weight="medium" className="text-white">선택 완료</Text>
                      </Pressable>
                    </Stack>
                  ) : (
                    <Row gap="xl">
                      {textbookLabel && (
                        <Pressable onPress={() => setShowTextbookPicker(true)} className="gap-s w-[104px]">
                          <View className="w-[104px] h-[134px] rounded-xxs bg-neutral-700 items-center justify-center">
                            <Icon name="book" size={32} color="#8A919E" />
                          </View>
                          <Stack gap="xxs">
                            <Text variant="base-small" weight="medium" className="text-white">{textbookLabel.textbookName}</Text>
                            <Text variant="base-small" color="secondary">{textbookLabel.subjectName}</Text>
                          </Stack>
                        </Pressable>
                      )}
                      <Pressable onPress={() => setShowTextbookPicker(true)} className="gap-s w-[104px]">
                        <View className="w-[104px] h-[134px] rounded-xxs bg-neutral-700 border-2 border-dashed border-neutral-600 items-center justify-center">
                          <Icon name="plus" size={24} color="#8A919E" />
                        </View>
                        <Text variant="base-small" color="secondary">교과서 {textbookLabel ? "변경하기" : "추가하기"}</Text>
                      </Pressable>
                    </Row>
                  )}
                </Stack>

                {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}
              </Stack>
            </ScrollView>
          </Stack>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
