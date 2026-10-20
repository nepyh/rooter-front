import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import Animated, { SlideOutLeft } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text, LoadingView } from "@/components";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject } from "@/api/catalog";
import type { Subject, Textbook } from "@/api/catalog";
import { getUserInfo } from "@/api/user";
import { useUserStore } from "@/store";
import { color } from "@/constants/token/color";

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

function TextbookCard({ textbook, onPress }: { textbook: TextbookWithSubject; onPress: () => void }) {
  // 서버 출판사 이름, 없으면 제목 괄호 안 출판사
  const publisherName = textbook.publisherName ?? textbook.title.match(/\(([^)]+)\)\s*$/)?.[1] ?? textbook.subjectName;
  // 출판사는 아랫줄에 따로 보여서 제목에서 제외
  const displayTitle = textbook.title.replace(/\s*\([^)]+\)\s*$/, "");

  return (
    <Pressable onPress={onPress} className="gap-s" style={{ width: 104 }}>
      <View
        className="rounded-xxs bg-neutral-700 items-center justify-center overflow-hidden"
        style={{ aspectRatio: 210 / 270 }}
      >
        {textbook.coverImageUrl ? (
          <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="book" size={32} color={color.neutral["400"]} />
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

  // 과목·교과서를 불러오는 동안 빈 격자 대신 불러오는 중 표시
  const [loadingTextbooks, setLoadingTextbooks] = useState(true);
  const userId = useUserStore((state) => state.userId);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    getSubjects()
      .then((list) => {
        setSubjects(list);
        if (list.length === 0) setLoadingTextbooks(false);
      })
      .catch(() => setLoadingTextbooks(false));
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
    setLoadingTextbooks(true);
    Promise.all(
      targets.map((subject) =>
        getTextbooksBySubject(subject.id)
          .then((list) => list.map((textbook) => ({ ...textbook, subjectName: subject.name })))
          .catch(() => [] as TextbookWithSubject[])
      )
    ).then((lists) => {
      setTextbooks(lists.flat());
      setLoadingTextbooks(false);
    });
  }, [subjects, selectedSubjectId]);

  // 선택 버튼 없이 교과서를 누르면 바로 목차 선택으로
  // 고른 교과서를 먼저 기억해 왼쪽으로 밀려나는 퇴장을 켠 뒤 이동, 목차 화면은 오른쪽에서 들어옴
  const [nextTextbookId, setNextTextbookId] = useState<number | null>(null);
  const handleSelect = (id: number) => setNextTextbookId(id);

  useEffect(() => {
    if (nextTextbookId === null) return;
    router.push({
      pathname: "/ChapterSelectPage",
      params: { examDate, textbookIds: String(nextTextbookId) },
    });
  }, [nextTextbookId, examDate]);

  // 목차에서 돌아오면 다시 고를 수 있게 초기화
  useFocusEffect(useCallback(() => setNextTextbookId(null), []));

  // 새로고침·링크로 바로 열려 돌아갈 화면이 없으면 시험 날짜 선택으로
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/ExamDatePage"));

  return (
    <Animated.View exiting={nextTextbookId !== null ? SlideOutLeft.duration(300) : undefined} className="flex-1">
      <StatusBar style="light" />

      <Row width="full" className="items-center pb-l">
        <Pressable onPress={goBack}>
          <Icon name="chevronLeft" size={28} />
        </Pressable>
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

      {loadingTextbooks ? <LoadingView /> : (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="flex-row flex-wrap" style={{ gap: 20 }}>
          {visibleTextbooks.map((textbook) => (
            <TextbookCard
              key={textbook.id}
              textbook={textbook}
              onPress={() => handleSelect(textbook.id)}
            />
          ))}
        </View>
      </ScrollView>
      )}
    </Animated.View>
  );
}
