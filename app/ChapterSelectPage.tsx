import { useEffect, useMemo, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { SlideInRight, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Text, LoadingView, LoadingScreen } from "@/components";
import { Icon } from "@/assets";
import { getTextbookDetail } from "@/api/catalog";
import type { ChapterTree, TextbookDetail } from "@/api/catalog";
import type { PlanGenerationSubjectInput } from "@/api/planGeneration";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/token";

// ================================
// Helpers
// ================================

// 스크롤이 바닥에서 이 거리(px) 안으로 들어오면 하단 흐림 효과를 감춥니다
const BOTTOM_FADE_THRESHOLD = 24;

// 화면에 그리는 순서(대단원→중단원→소단원, chapterOrder 오름차순)대로 소단원만 뽑아냅니다.
const flattenLeaves = (nodes: ChapterTree[]): ChapterTree[] =>
  [...nodes]
    .sort((a, b) => a.chapterOrder - b.chapterOrder)
    .flatMap((node) => (node.children.length === 0 ? [node] : flattenLeaves(node.children)));

// 학교마다 목차 순서대로 진도를 나가지 않아서, 고른 소단원을 이어 붙이지 않고 하나씩 따로 보냄
const toSubjectEntries = (textbookId: number, leaves: ChapterTree[], selectedIds: Set<number>): PlanGenerationSubjectInput[] =>
  leaves
    .filter((leaf) => selectedIds.has(leaf.id))
    .map((leaf) => ({ textbookId, startChapterId: leaf.id, endChapterId: leaf.id }));

// ================================
// Components
// ================================

// 자식이 없는 노드만 소단원(선택 가능한 leaf)이고, 자식이 있으면 대단원/중단원 라벨입니다
function ChapterNode({ node, depth, selectedIds, onToggleLeaf }: {
  node: ChapterTree;
  depth: number;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}) {
  const isLeaf = node.children.length === 0;

  if (isLeaf) {
    const selected = selectedIds.has(node.id);
    return (
      <Pressable
        onPress={() => onToggleLeaf(node.id)}
        className={`flex-row items-center gap-spacing-4 px-spacing-5 py-spacing-4 rounded-radius-2 w-full ${selected ? "bg-neutral-600" : ""}`}
      >
        {selected && <Icon name="check" size={20} />}
        <Text variant="base-large" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
      </Pressable>
    );
  }

  return (
    <Stack gap="xs" width="full">
      <Text variant={depth === 0 ? "header-large" : "base-large"} weight={depth === 0 ? "semibold" : "medium"} className="text-text-primary">
        {node.chapterName}
      </Text>
      <Stack gap="xxs" width="full">
        {[...node.children]
          .sort((a, b) => a.chapterOrder - b.chapterOrder)
          .map((child) => (
            <ChapterNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleLeaf={onToggleLeaf} />
          ))}
      </Stack>
    </Stack>
  );
}

// 최상위(대단원)만 펼치고 접을 수 있고, 그 안의 중단원/소단원은 펼쳐진 상태로 항상 함께 보입니다
function TopLevelAccordion({ node, expanded, onToggle, selectedIds, onToggleLeaf }: {
  node: ChapterTree;
  expanded: boolean;
  onToggle: () => void;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
}) {
  return (
    <Stack width="full" className={expanded ? "bg-neutral-700 rounded-radius-3 overflow-hidden" : ""}>
      <Pressable onPress={onToggle} className={`flex-row items-center justify-between px-spacing-6 py-spacing-5 w-full ${expanded ? "bg-neutral-700" : "rounded-radius-3"}`}>
        <Text variant="header-large" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
        <View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}>
          <Icon name="chevronRight" size={28} />
        </View>
      </Pressable>
      {expanded && (
        <Stack gap="m" width="full" className="px-spacing-6 pt-spacing-5 pb-spacing-4">
          {[...node.children]
            .sort((a, b) => a.chapterOrder - b.chapterOrder)
            .map((child) => (
              <ChapterNode key={child.id} node={child} depth={1} selectedIds={selectedIds} onToggleLeaf={onToggleLeaf} />
            ))}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * 목차 선택 화면
 */
export default function ChapterSelectPage() {
  const { examDate, textbookIds } = useLocalSearchParams<{ examDate: string; textbookIds: string }>();
  const [textbooks, setTextbooks] = useState<TextbookDetail[]>([]);
  // 목차를 불러오는 동안 빈 목록 대신 불러오는 중 표시
  const [loadingChapters, setLoadingChapters] = useState(true);
  // 대단원 토글은 여러 개 동시에 펼칠 수 있음
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  // 구글 폼처럼 [생성]을 눌렀을 때 빠진 교과서에 필수 안내 표시
  const [showRequired, setShowRequired] = useState(false);
  // 누른 소단원만 체크
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  // 로딩 중 뒤로가기를 누르면 늦게 온 생성 결과는 무시
  const submitIdRef = useRef(0);
  const overlayOpacity = useSharedValue(1);

  const leavesByTextbook = useMemo(
    () => Object.fromEntries(textbooks.map((tb) => [tb.id, flattenLeaves(tb.chapters)])) as Record<number, ChapterTree[]>,
    [textbooks],
  );

  // 교과서마다 목차를 하나 이상 골라야 생성 가능
  const missingIds = new Set(textbooks.filter((tb) => !leavesByTextbook[tb.id]?.some((leaf) => selectedIds.has(leaf.id))).map((tb) => tb.id));

  useEffect(() => {
    const ids = (textbookIds ?? "").split(",").filter(Boolean).map(Number);
    Promise.all(ids.map((id) => getTextbookDetail(id).catch(() => null)))
      .then((details) => setTextbooks(details.filter((d): d is TextbookDetail => d !== null)))
      .finally(() => setLoadingChapters(false));
  }, [textbookIds]);

  const toggleLeaf = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (textbooks.length === 0) return;
    if (missingIds.size > 0) {
      setShowRequired(true);
      return;
    }
    const subjects = textbooks.flatMap((tb) => toSubjectEntries(tb.id, leavesByTextbook[tb.id] ?? [], selectedIds));
    // 플랜 생성은 수면 시간·공부 스타일 설문을 마친 뒤
    router.push({ pathname: "/SleepTimePage", params: { examDate, subjects: JSON.stringify(subjects) } });
  };

  // 새로고침·링크로 바로 열려 돌아갈 화면이 없으면 교과서 선택으로
  const goBack = () => (router.canGoBack() ? router.back() : router.replace({ pathname: "/TextbookSelectPage", params: { examDate } }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    overlayOpacity.value = withTiming(distanceFromBottom < BOTTOM_FADE_THRESHOLD ? 0 : 1, { duration: 200 });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  // AI가 시험일까지 계획을 만드는 동안 전체 화면 로딩
  if (submitting) {
    const cancelSubmit = () => {
      submitIdRef.current += 1;
      setSubmitting(false);
    };
    return <LoadingScreen text="플랜 생성 중..." onBack={cancelSubmit} />;
  }

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <View className="flex-1">
        <StatusBar style="light" />

        <Row width="full" align="between" className="items-center pb-spacing-5">
          <Row gap="s" className="items-center">
            <Pressable onPress={goBack}>
              <Icon name="chevronLeft" size={28} />
            </Pressable>
            <Text variant="header-medium" weight="semibold" color="secondary">교과서 선택</Text>
          </Row>
          <Text variant="base-large" color="disabled">{`${selectedIds.size}개 선택됨`}</Text>
        </Row>

        <Stack gap="s" width="full" className="pb-spacing-6">
          <Text variant="title-medium" weight="semibold">목차 선택</Text>
          <Text variant="base-medium" color="secondary">시험 범위에 알맞는 교과서의 목차를 선택해주세요</Text>
        </Stack>

        {loadingChapters ? <LoadingView /> : (
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingBottom: getSpacing("spacing-9"), gap: getSpacing("spacing-7") }}
          >
            {textbooks.map((textbook) => (
              <Stack key={textbook.id} gap="m" width="full">
                {/* 교과서 여러 권이면 구역 제목, 디자인에 없어 "교과서 선택" 글자 스타일 재사용 */}
                {textbooks.length > 1 && (
                  <Text variant="header-medium" weight="semibold" color="secondary" className="pt-spacing-3">{textbook.title}</Text>
                )}
                {showRequired && missingIds.has(textbook.id) && (
                  <Text variant="base-small" style={{ color: color.utility["error-primary"] }}>* 필수 항목이에요. 목차를 하나 이상 선택해주세요</Text>
                )}
                {[...textbook.chapters]
                  .sort((a, b) => a.chapterOrder - b.chapterOrder)
                  .map((node) => (
                    <TopLevelAccordion
                      key={node.id}
                      node={node}
                      expanded={expandedIds.has(node.id)}
                      onToggle={() => setExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                        return next;
                      })}
                      selectedIds={selectedIds}
                      onToggleLeaf={toggleLeaf}
                    />
                  ))}
              </Stack>
            ))}
          </ScrollView>
          <Animated.View
            pointerEvents="none"
            className="bg-background-primary"
            style={[{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56 }, overlayStyle]}
          />
        </View>
        )}

        {showRequired && missingIds.size > 0 && (
          <Text variant="base-small" className="text-center pt-spacing-4" style={{ color: color.utility["error-primary"] }}>
            선택하지 않은 필수 항목이 있어요
          </Text>
        )}
        <Pressable
          onPress={handleSubmit}
          className="h-spacing-12 rounded-radius-4 items-center justify-center w-full mt-spacing-5 mb-spacing-6 bg-primary-500"
        >
          <Text variant="base-medium" weight="medium" className="text-text-primary">다음</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
