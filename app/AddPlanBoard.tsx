import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Input, Button, Text } from "@/components";
import { getSubjects, getTextbooksBySubject, getChaptersByTextbook } from "@/api/catalog";
import type { Subject, Textbook, Chapter } from "@/api/catalog";
import { createPlanBoard } from "@/api/planBoard";

// ================================
// Helpers
// ================================

const parseClock = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 24 || m > 59) return null;
  return { h, m };
};

const toIsoTime = (base: Date, value: string) => {
  const clock = parseClock(value);
  if (!clock) return null;
  const date = new Date(base);
  date.setHours(clock.h, clock.m, 0, 0);
  return date;
};

// ================================
// Components
// ================================

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
 * 플랜보드 생성 화면
 * @description 과목 → 교과서 → 단원을 순서대로 골라 새로운 플랜보드를 만듭니다. (디자인 미정으로 임의 구성)
 */
export default function AddPlanBoard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [textbookId, setTextbookId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

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

  const handleSubmit = async () => {
    if (!title.trim() || subjectId === null || textbookId === null || chapterId === null) {
      setError("과목/교과서/단원과 제목을 모두 입력해주세요.");
      return;
    }

    const start = toIsoTime(new Date(), startText);
    let end = start ? toIsoTime(new Date(), endText) : null;
    if (!start || !end) {
      setError("시간을 HH:MM 형식으로 입력해주세요.");
      return;
    }
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    setError("");
    setSubmitting(true);
    try {
      await createPlanBoard({
        title: title.trim(),
        subjectId,
        textbookId,
        chapterId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      });
      router.back();
    } catch {
      setError("플랜보드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Stack gap="xxl" className="flex-1">
        <Stack gap="s">
          <Text variant="title-medium">플랜보드 추가</Text>
          <Text color="secondary">과목, 교과서, 단원을 선택하고 시간을 입력해주세요</Text>
        </Stack>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Stack gap="xl">
            <PickerRow label="과목" options={subjects} selectedId={subjectId} onSelect={setSubjectId} emptyText="과목을 불러오는 중입니다." />
            {subjectId !== null && (
              <PickerRow label="교과서" options={textbooks} selectedId={textbookId} onSelect={setTextbookId} emptyText="교과서를 불러오는 중입니다." />
            )}
            {textbookId !== null && (
              <PickerRow label="단원" options={chapters} selectedId={chapterId} onSelect={setChapterId} emptyText="단원을 불러오는 중입니다." />
            )}

            <Input label="제목" value={title} onChangeText={setTitle} placeholder="예: 수학 문제집 풀기" />
            <Row gap="m" width="full">
              <View className="flex-1">
                <Input label="시작 시간" placeholder="HH:MM" value={startText} onChangeText={setStartText} />
              </View>
              <View className="flex-1">
                <Input label="종료 시간" placeholder="HH:MM" value={endText} onChangeText={setEndText} />
              </View>
            </Row>
            {!!error && <Text style={{ color: "#FF4D4F" }}>{error}</Text>}
          </Stack>
        </ScrollView>

        <Row gap="m" width="full">
          <View className="flex-1">
            <Button variant="disabled" disabled={false} onPress={() => router.back()}> 취소 </Button>
          </View>
          <View className="flex-1">
            <Button variant={canSubmit ? "primary" : "disabled"} onPress={handleSubmit}> 추가 </Button>
          </View>
        </Row>
      </Stack>
    </View>
  );
}
