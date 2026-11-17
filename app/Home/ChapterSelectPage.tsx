import { useEffect, useMemo, useState } from "react";
import { Pressable, View, type TextStyle } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, LoadingView, BackHeader, PageTitle, ChapterList } from "@/components";
import type { ChapterTree, TextbookDetail } from "@/api/home/common/catalog";
import { getTextbookDetails } from "@/api/home/ChapterSelectPage";
import { flattenLeaves, toSubjectEntries } from "@/utils/home/chapter";
import { usePlanDraftStore } from "@/store";
import { color } from "@/constants/token/color";

// ================================
// Types
// ================================

type SelectionState = "selected" | "empty";

// ================================
// Styles
// ================================

// 하나라도 고르면 눌러서 돌아갈 수 있는 버튼처럼 주황색, 아무것도 안 골랐으면 Text 의 회색(disabled) 그대로
// Text 가 항상 색 클래스를 붙여 className 으로는 덮어써지지 않아서 style 로 지정
const selectionStyles: Record<SelectionState, TextStyle> = {
  "selected": { color: color.primary["500"] },
  "empty": {},
};

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
 * 오른쪽 위 "N개 선택됨"을 누르면 고른 목차를 그대로 두고 교과서 선택 화면으로 돌아감
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

  const selectionState: SelectionState = selectedIds.size > 0 ? "selected" : "empty";

  const goBack = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/Home/TextbookSelectPage", params: { examDate } }));

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <View className="flex-1">
        <StatusBar style="light" />
        <BackHeader
          onBack={goBack}
          title="교과서 선택"
          right={
            <Pressable
              onPress={goBack}
              disabled={selectionState === "empty"}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`${selectedIds.size}개 선택됨, 교과서 선택으로 돌아가기`}
              accessibilityState={{ disabled: selectionState === "empty" }}
            >
              <Text variant="base-large" weight="semibold" color="disabled" style={selectionStyles[selectionState]}>
                {`${selectedIds.size}개 선택됨`}
              </Text>
            </Pressable>
          }
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
