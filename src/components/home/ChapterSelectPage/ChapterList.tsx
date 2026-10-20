import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack } from "../../layout";
import { Text } from "../../ui/Text";
import { TopLevelAccordion } from "./TopLevelAccordion";
import type { TextbookDetail } from "@/api/catalog";
import { sortByChapterOrder } from "@/utils/home/chapter";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/token";

// ================================
// Constants
// ================================

const BOTTOM_FADE_THRESHOLD = 24;

// ================================
// Components
// ================================

interface Props {
  textbooks: TextbookDetail[];
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  selectedIds: Set<number>;
  onToggleLeaf: (id: number) => void;
  missingIds: Set<number>;
  showRequired: boolean;
}

/**
 * 교과서별 대단원 목록. 스크롤이 바닥 근처가 아니면 아래쪽을 흐리게 덮어 더 있다는 걸 보여줌
 * @param textbooks 목차를 보여줄 교과서들 (여러 권이면 교과서 제목으로 구역을 나눔)
 * @param expandedIds 펼친 대단원 id
 * @param onToggleExpand 대단원을 펼치거나 접을 때 호출
 * @param selectedIds 고른 소단원 id
 * @param onToggleLeaf 소단원을 눌렀을 때 호출
 * @param missingIds 아직 목차를 하나도 고르지 않은 교과서 id
 * @param showRequired 고르지 않은 교과서에 필수 안내를 띄울지
 */
export function ChapterList({ textbooks, expandedIds, onToggleExpand, selectedIds, onToggleLeaf, missingIds, showRequired }: Props) {
  const overlayOpacity = useSharedValue(1);
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    overlayOpacity.value = withTiming(distanceFromBottom < BOTTOM_FADE_THRESHOLD ? 0 : 1, { duration: 200 });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: getSpacing("spacing-9"), gap: getSpacing("spacing-7") }}
      >
        {textbooks.map((textbook) => (
          <Stack key={textbook.id} gap="m" width="full">
            {textbooks.length > 1 && (
              <Text variant="header-medium" weight="semibold" color="secondary" className="pt-spacing-3">{textbook.title}</Text>
            )}
            {showRequired && missingIds.has(textbook.id) && (
              <Text variant="base-small" style={{ color: color.utility["error-primary"] }}>* 필수 항목이에요. 목차를 하나 이상 선택해주세요</Text>
            )}
            {sortByChapterOrder(textbook.chapters).map((node) => (
              <TopLevelAccordion
                key={node.id}
                node={node}
                expanded={expandedIds.has(node.id)}
                onToggle={() => onToggleExpand(node.id)}
                selectedIds={selectedIds}
                onToggleLeaf={onToggleLeaf}
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
  );
}
