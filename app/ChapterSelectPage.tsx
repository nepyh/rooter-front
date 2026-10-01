import { useEffect, useMemo, useState } from "react";
import { Alert, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { SlideInRight, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { getTextbookDetail } from "@/api/catalog";
import type { ChapterTree, TextbookDetail } from "@/api/catalog";
import { generatePlan } from "@/api/planGeneration";
import type { PlanGenerationSubjectInput } from "@/api/planGeneration";

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

// AI 계획 생성 API가 교과서당 시작~끝 하나의 범위만 받아서, 선택도 교과서별 소단원 순번 범위로 관리
interface LeafRange {
  start: number;
  end: number;
}

// 계획 생성 실패 시 백엔드 code별 안내 문구
const GENERATE_ERROR_MESSAGES: Record<string, string> = {
  "INVALID_DATE_RANGE": "시험일은 내일 이후로 선택해주세요.",
  "MISSING_DATE_INFO": "시험 날짜를 다시 선택해주세요.",
  "INVALID_DATE_FORMAT": "시험 날짜를 다시 선택해주세요.",
  "SUBJECTS_REQUIRED": "목차를 하나 이상 선택해주세요.",
  "INVALID_SUBJECT_RANGE": "선택한 목차 범위를 다시 확인해주세요.",
  "INVALID_TITLE": "계획 이름이 올바르지 않아요.",
  "GENERATION_FAILED": "AI가 계획을 만들지 못했어요. 잠시 후 다시 시도해주세요.",
};

const getGenerateErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return "학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";
  if (error.code === "ECONNABORTED") return "계획을 만드는 데 시간이 너무 오래 걸렸어요. 잠시 후 다시 시도해주세요.";
  if (!error.response) return "인터넷 연결을 확인해주세요.";
  return GENERATE_ERROR_MESSAGES[error.response.data?.code] ?? "학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.";
};

// 범위 안 소단원을 누르면 거기서 자르고, 밖을 누르면 그 소단원까지 늘림
const toggleInRange = (range: LeafRange | undefined, index: number): LeafRange | undefined => {
  if (!range) return { start: index, end: index };
  if (index < range.start) return { ...range, start: index };
  if (index > range.end) return { ...range, end: index };
  const next = index === range.start ? { ...range, start: index + 1 } : { ...range, end: index - 1 };
  return next.start > next.end ? undefined : next;
};

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
        className={`flex-row items-center gap-m px-l py-m rounded-xs w-full ${selected ? "bg-neutral-600" : ""}`}
      >
        {selected && <Icon name="check" size={20} />}
        <Text variant="base-large" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
      </Pressable>
    );
  }

  return (
    <Stack gap="xs" width="full">
      <Text variant={depth === 0 ? "header-large" : "base-large"} weight={depth === 0 ? "semibold" : "medium"} className="text-white">
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
    <Stack width="full" className={expanded ? "bg-neutral-700 rounded-sm overflow-hidden" : ""}>
      <Pressable onPress={onToggle} className={`flex-row items-center justify-between px-xl py-l w-full ${expanded ? "bg-neutral-700" : "rounded-sm"}`}>
        <Text variant="header-large" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{node.chapterName}</Text>
        <View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}>
          <Icon name="chevronRight" size={28} />
        </View>
      </Pressable>
      {expanded && (
        <Stack gap="m" width="full" className="px-xl pt-l pb-m">
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ranges, setRanges] = useState<Record<number, LeafRange>>({});
  const [submitting, setSubmitting] = useState(false);
  const overlayOpacity = useSharedValue(1);

  const leavesByTextbook = useMemo(
    () => Object.fromEntries(textbooks.map((tb) => [tb.id, flattenLeaves(tb.chapters)])) as Record<number, ChapterTree[]>,
    [textbooks],
  );

  // 소단원 id → 소속 교과서와 순번
  const leafLocation = useMemo(() => {
    const map = new Map<number, { textbookId: number; index: number }>();
    Object.entries(leavesByTextbook).forEach(([textbookId, leaves]) => {
      leaves.forEach((leaf, index) => map.set(leaf.id, { textbookId: Number(textbookId), index }));
    });
    return map;
  }, [leavesByTextbook]);

  // 화면 체크 표시 = 실제로 보낼 범위
  const selectedIds = useMemo(() => {
    const ids = new Set<number>();
    Object.entries(ranges).forEach(([textbookId, range]) => {
      leavesByTextbook[Number(textbookId)]?.slice(range.start, range.end + 1).forEach((leaf) => ids.add(leaf.id));
    });
    return ids;
  }, [ranges, leavesByTextbook]);

  useEffect(() => {
    const ids = (textbookIds ?? "").split(",").filter(Boolean).map(Number);
    Promise.all(ids.map((id) => getTextbookDetail(id).catch(() => null)))
      .then((details) => setTextbooks(details.filter((d): d is TextbookDetail => d !== null)));
  }, [textbookIds]);

  const toggleLeaf = (id: number) => {
    const location = leafLocation.get(id);
    if (!location) return;
    setRanges((prev) => {
      const nextRange = toggleInRange(prev[location.textbookId], location.index);
      const next = { ...prev };
      if (nextRange) next[location.textbookId] = nextRange; else delete next[location.textbookId];
      return next;
    });
  };

  const handleSubmit = async () => {
    const subjects: PlanGenerationSubjectInput[] = Object.entries(ranges).map(([textbookId, range]) => {
      const leaves = leavesByTextbook[Number(textbookId)];
      return { textbookId: Number(textbookId), startChapterId: leaves[range.start].id, endChapterId: leaves[range.end].id };
    });

    if (subjects.length === 0) return;

    setSubmitting(true);
    try {
      await generatePlan({
        title: examDate ? `${examDate} 시험 대비` : "새 학습 계획",
        subjects,
        examDate: examDate || undefined,
      });
      router.replace("/home");
    } catch (error) {
      Alert.alert("계획 생성 실패", getGenerateErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    overlayOpacity.value = withTiming(distanceFromBottom < BOTTOM_FADE_THRESHOLD ? 0 : 1, { duration: 200 });
  };

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  return (
    <Animated.View entering={SlideInRight.duration(300)} style={{ flex: 1 }}>
      <View className="flex-1">
        <StatusBar style="light" />

        <Row width="full" align="between" className="items-center pb-l">
          <Row gap="s" className="items-center">
            <Pressable onPress={() => router.back()}>
              <Icon name="chevronLeft" size={28} />
            </Pressable>
            <Text variant="header-medium" weight="semibold" color="secondary">교과서 선택</Text>
          </Row>
          <Text variant="base-large" color="disabled">{`${selectedIds.size}개 선택됨`}</Text>
        </Row>

        <Stack gap="s" width="full" className="pb-xl">
          <Text variant="title-medium" weight="semibold">목차 선택</Text>
          <Text variant="base-medium" color="secondary">시험 범위에 알맞는 교과서의 목차를 선택해주세요</Text>
        </Stack>

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingBottom: 32, gap: 24 }}
          >
            {textbooks.map((textbook) => (
              <Stack key={textbook.id} gap="m" width="full">
                {/* 교과서 여러 권이면 구역 제목, 디자인에 없어 "교과서 선택" 글자 스타일 재사용 */}
                {textbooks.length > 1 && (
                  <Text variant="header-medium" weight="semibold" color="secondary" className="pt-s">{textbook.title}</Text>
                )}
                {[...textbook.chapters]
                  .sort((a, b) => a.chapterOrder - b.chapterOrder)
                  .map((node) => (
                    <TopLevelAccordion
                      key={node.id}
                      node={node}
                      expanded={expandedId === node.id}
                      onToggle={() => setExpandedId((prev) => (prev === node.id ? null : node.id))}
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

        <Pressable
          onPress={handleSubmit}
          disabled={selectedIds.size === 0 || submitting}
          className={`h-16 rounded-md items-center justify-center w-full mt-l mb-xl ${selectedIds.size > 0 && !submitting ? "bg-primary-500" : "bg-neutral-700"}`}
        >
          <Text variant="base-medium" weight="medium" className="text-white">
            {submitting ? "계획 생성 중..." : "AI 학습 계획 생성"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
