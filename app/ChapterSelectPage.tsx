import { useEffect, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import Animated, { SlideInRight, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Text } from "@/components";
import { Icon } from "@/assets";
import { getTextbookDetail } from "@/api/catalog";
import type { ChapterTree } from "@/api/catalog";

// ================================
// Helpers
// ================================

// 스크롤이 바닥에서 이 거리(px) 안으로 들어오면 하단 흐림 효과를 감춥니다
const BOTTOM_FADE_THRESHOLD = 24;

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
  const { textbookIds } = useLocalSearchParams<{ examDate: string; textbookIds: string }>();
  const [roots, setRoots] = useState<ChapterTree[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    const ids = (textbookIds ?? "").split(",").filter(Boolean).map(Number);
    Promise.all(ids.map((id) => getTextbookDetail(id).catch(() => null)))
      .then((details) => setRoots(details.filter((d): d is NonNullable<typeof d> => d !== null).flatMap((d) => d.chapters)));
  }, [textbookIds]);

  const toggleLeaf = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
            contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
          >
            {roots.map((node) => (
              <TopLevelAccordion
                key={node.id}
                node={node}
                expanded={expandedId === node.id}
                onToggle={() => setExpandedId((prev) => (prev === node.id ? null : node.id))}
                selectedIds={selectedIds}
                onToggleLeaf={toggleLeaf}
              />
            ))}
          </ScrollView>
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, backgroundColor: "#33363F" }, overlayStyle]}
          />
        </View>
      </View>
    </Animated.View>
  );
}
