import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject } from "@/api/catalog";
import type { Subject, Textbook } from "@/api/catalog";
import { getUserInfo } from "@/api/user";
import { useUserStore } from "@/store";

// ================================
// Types
// ================================

interface TextbookWithSubject extends Textbook {
  subjectName: string;
}

// ================================
// Components
// ================================

function SubjectPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-l py-m rounded-full ${active ? "bg-neutral-600" : "border border-neutral-600"}`}
    >
      <Text variant="base-medium" weight="medium" className="text-white">{label}</Text>
    </Pressable>
  );
}

function TextbookCard({ textbook, selected, onPress }: { textbook: TextbookWithSubject; selected: boolean; onPress: () => void }) {
  // 서버 출판사 이름, 없으면 제목 괄호 안 출판사
  const publisherName = textbook.publisherName ?? textbook.title.match(/\(([^)]+)\)\s*$/)?.[1] ?? textbook.subjectName;
  // 출판사는 아랫줄에 따로 보여서 제목에서 제외
  const displayTitle = textbook.title.replace(/\s*\([^)]+\)\s*$/, "");

  return (
    <Pressable onPress={onPress} className="gap-s" style={{ width: 104 }}>
      <View
        className="rounded-xxs bg-neutral-700 items-center justify-center overflow-hidden"
        style={{ aspectRatio: 210 / 270, borderWidth: selected ? 2 : 0, borderColor: "#F6482D" }}
      >
        {textbook.coverImageUrl ? (
          <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="book" size={32} color="#8A919E" />
        )}
        {selected && <View className="absolute inset-0 rounded-xxs" style={{ backgroundColor: "rgba(246,72,45,0.3)" }} />}
        {selected && (
          <View className="absolute top-xs right-xs w-5 h-5 rounded-full bg-primary-500 items-center justify-center">
            <Icon name="check" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Stack gap="xxs" width="full">
        <Text variant="base-small" weight="medium" className="text-white" numberOfLines={1}>{displayTitle}</Text>
        <Text variant="base-small" color="secondary" numberOfLines={1}>{publisherName}</Text>
      </Stack>
    </Pressable>
  );
}

/**
 * 교과서 선택 화면
 */
export default function TextbookSelectPage() {
  const { examDate } = useLocalSearchParams<{ examDate: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [textbooks, setTextbooks] = useState<TextbookWithSubject[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const userId = useUserStore((state) => state.userId);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  // 회원가입 때 입력한 학년, 못 불러오면 전체 표시
  useEffect(() => {
    if (userId === null) return;
    getUserInfo(userId).then((info) => setGrade(info.grade)).catch(() => setGrade(null));
  }, [userId]);

  // 제목이 "N학년 ..."으로 시작해서 학년 기준으로 거름, 학년 표기 없는 교과서는 유지
  const visibleTextbooks = grade === null
    ? textbooks
    : textbooks.filter((textbook) => {
      const titleGrade = textbook.title.match(/^(\d)학년/)?.[1];
      return titleGrade === undefined || Number(titleGrade) === grade;
    });

  useEffect(() => {
    if (subjects.length === 0) return;

    const targets = selectedSubjectId === null ? subjects : subjects.filter((s) => s.id === selectedSubjectId);
    Promise.all(
      targets.map((subject) =>
        getTextbooksBySubject(subject.id)
          .then((list) => list.map((textbook) => ({ ...textbook, subjectName: subject.name })))
          .catch(() => [] as TextbookWithSubject[])
      )
    ).then((lists) => setTextbooks(lists.flat()));
  }, [subjects, selectedSubjectId]);

  const toggleTextbook = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelect = () => {
    if (selectedIds.size === 0) return;
    router.push({
      pathname: "/ChapterSelectPage",
      params: { examDate, textbookIds: Array.from(selectedIds).join(",") },
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" align="between" className="items-center pb-l">
        <Pressable onPress={() => router.back()}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
        <Text variant="base-large" color="disabled">{`${selectedIds.size}개 선택됨`}</Text>
      </Row>

      <Stack gap="s" width="full" className="pb-xl">
        <Text variant="title-medium" weight="semibold">교과서 선택</Text>
        <Text variant="base-medium" color="secondary">시험 범위에 알맞는 교과서를 선택해주세요</Text>
      </Stack>

      <Row gap="s" className="pb-xl">
        <SubjectPill label="전체" active={selectedSubjectId === null} onPress={() => setSelectedSubjectId(null)} />
        {subjects.map((subject) => (
          <SubjectPill
            key={subject.id}
            label={subject.name}
            active={selectedSubjectId === subject.id}
            onPress={() => setSelectedSubjectId(subject.id)}
          />
        ))}
      </Row>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="flex-row flex-wrap" style={{ gap: 20 }}>
          {visibleTextbooks.map((textbook) => (
            <TextbookCard
              key={textbook.id}
              textbook={textbook}
              selected={selectedIds.has(textbook.id)}
              onPress={() => toggleTextbook(textbook.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSelect}
        disabled={selectedIds.size === 0}
        className="h-16 rounded-md items-center justify-center w-full mb-xl"
        style={{ backgroundColor: selectedIds.size > 0 ? "#F6482D" : "#3F4552" }}
      >
        <Text variant="base-medium" weight="medium" className="text-white">선택</Text>
      </Pressable>
    </View>
  );
}
