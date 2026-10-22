import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, LoadingView, BackHeader, PageTitle, ChapterList } from "@/components";
import type { ChapterTree, TextbookDetail } from "@/api/home/common/catalog";
import { getTextbookDetails } from "@/api/home/ChapterSelectPage";
import { flattenLeaves, toSubjectEntries } from "@/utils/home/chapter";
import { usePlanDraftStore } from "@/store";

// ================================
// Helpers
// ================================

const toggleInSet = (set: Set<number>, id: number) => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
};

// ================================
// Components
// ================================

/**
 * 목차 선택 화면
 */
export default function ChapterSelectPage() {
  const { examDate, textbookIds } = useLocalSearchParams<{ examDate: string; textbookIds: string }>();
  const [textbooks, setTextbooks] = useState<TextbookDetail[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const subjectsByTextbook = usePlanDraftStore((state) => state.subjectsByTextbook);
  const setTextbookSubjects = usePlanDraftStore((state) => state.setTextbookSubjects);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set((textbookIds ?? "").split(",").flatMap((id) => subjectsByTextbook[Number(id)] ?? []).map((subject) => subject.startChapterId)),
  );

  const leavesByTextbook = useMemo(
    () => Object.fromEntries(textbooks.map((tb) => [tb.id, flattenLeaves(tb.chapters)])) as Record<number, ChapterTree[]>,
    [textbooks],
  );

  useEffect(() => {
    getTextbookDetails(textbookIds ?? "")
      .then(setTextbooks)
      .finally(() => setLoadingChapters(false));
  }, [textbookIds]);

  const handleToggleLeaf = (id: number) => {
    const next = toggleInSet(selectedIds, id);
    setSelectedIds(next);
    textbooks.forEach((tb) => setTextbookSubjects(tb.id, toSubjectEntries(tb.id, leavesByTextbook[tb.id] ?? [], next)));
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/Home/TextbookSelectPage", params: { examDate } }));

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <View className="flex-1">
        <StatusBar style="light" />
        <BackHeader
          onBack={goBack}
          title="교과서 선택"
          right={<Text variant="base-large" color="disabled">{`${selectedIds.size}개 선택됨`}</Text>}
        />
        <PageTitle title="목차 선택" description="시험 범위에 알맞는 교과서의 목차를 선택해주세요" className="pb-spacing-6" />

        {loadingChapters ? <LoadingView /> : (
          <ChapterList
            textbooks={textbooks}
            expandedIds={expandedIds}
            onToggleExpand={(id) => setExpandedIds((prev) => toggleInSet(prev, id))}
            selectedIds={selectedIds}
            onToggleLeaf={handleToggleLeaf}
          />
        )}
      </View>
    </Animated.View>
  );
}
