import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Stack, Row } from "@/components/layout";
import { Text, Input, Switch } from "@/components/ui";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject, getChaptersByTextbook } from "@/api/catalog";
import type { Subject, Textbook, Chapter } from "@/api/catalog";
import { createPlanBoard } from "@/api/planBoard";
import type { PlanBoard } from "@/api/planBoard";

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

// ================================
// Components
// ================================

function DatePill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-neutral-600 px-m py-s rounded-full">
      <Text variant="base-small" className="text-white">{label}</Text>
    </Pressable>
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

  const openPicker = (target: PickerTarget) => {
    const mode = target.endsWith("date") ? "date" : "time";
    const value = target.startsWith("start") ? start : end;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode,
        is24Hour: true,
        onValueChange: (_event, picked) => applyPicked(target, picked),
      });
      return;
    }

    setActivePicker(target);
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

  const activePickerValue = activePicker
    ? (activePicker.startsWith("start") ? start : end)
    : null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable>
          <Stack gap="xxl" width="full" className="bg-background-primary p-6 rounded-t-[32px]" style={{ maxHeight: "88%" }}>
            <Row width="full" align="between" className="items-center">
              <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
                <Icon name="close" size={24} />
              </Pressable>
              <Text variant="header-medium" weight="semibold">새로운 일정</Text>
              <Pressable onPress={handleSubmit} disabled={!canSubmit} className="w-8 h-8 items-center justify-center">
                <Icon name="check" size={24} color={canSubmit ? "#FFFFFF" : "#525866"} />
              </Pressable>
            </Row>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Stack gap="xl" width="full">
                <Stack gap="s" width="full">
                  <Text variant="base-medium">제목</Text>
                  <Input value={title} onChangeText={setTitle} placeholder="제목" />
                </Stack>

                <Stack gap="s" width="full">
                  <Text variant="base-medium">일시</Text>
                  <View className="w-full rounded-md overflow-hidden">
                    <Row width="full" align="between" className="items-center bg-neutral-700 px-xl py-l border-b-2 border-neutral-600">
                      <Text variant="base-large" weight="medium" className="text-white">하루종일</Text>
                      <Switch value={allDay} onToggle={() => setAllDay((prev) => !prev)} />
                    </Row>
                    <Row width="full" align="between" className={`items-center bg-neutral-700 px-xl py-l ${allDay ? "" : "border-b-2 border-neutral-600"}`}>
                      <Text variant="base-large" weight="medium" className="text-white">시작</Text>
                      <Row gap="xs">
                        <DatePill label={formatDatePill(start)} onPress={() => openPicker("start-date")} />
                        {!allDay && <DatePill label={formatTimePill(start)} onPress={() => openPicker("start-time")} />}
                      </Row>
                    </Row>
                    {!allDay && (
                      <Row width="full" align="between" className="items-center bg-neutral-700 px-xl py-l">
                        <Text variant="base-large" weight="medium" className="text-white">종료</Text>
                        <Row gap="xs">
                          <DatePill label={formatDatePill(end)} onPress={() => openPicker("end-date")} />
                          <DatePill label={formatTimePill(end)} onPress={() => openPicker("end-time")} />
                        </Row>
                      </Row>
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
        </Pressable>
      </Pressable>

      {Platform.OS === "ios" && activePicker && activePickerValue && (
        <View className="absolute bottom-0 w-full bg-neutral-700">
          <Row width="full" align="end" className="px-l pt-s">
            <Pressable onPress={() => setActivePicker(null)}>
              <Text variant="base-medium" weight="medium" style={{ color: "#F6482D" }}>완료</Text>
            </Pressable>
          </Row>
          <DateTimePicker
            value={activePickerValue}
            mode={activePicker.endsWith("date") ? "date" : "time"}
            display="spinner"
            themeVariant="dark"
            onValueChange={(_event, picked) => applyPicked(activePicker, picked)}
          />
        </View>
      )}
    </Modal>
  );
}
