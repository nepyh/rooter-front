import { useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack, Row, Button, Text } from "@/components";
import { Icon } from "@/assets";

// ================================
// Types
// ================================

type SubjectTab = "전체" | "수학" | "국어" | "한국사";

interface Textbook {
  id: string;
  subject: Exclude<SubjectTab, "전체">;
  title: string;
  publisher: string;
}

// ================================
// Constants
// ================================

const TABS: SubjectTab[] = ["전체", "수학", "국어", "한국사"];
const COLUMNS = 3;
const CARD_GAP = 20; // Row gap="xl"

const SUBJECT_COLORS: Record<Exclude<SubjectTab, "전체">, string> = {
  수학: "#FF5252",
  국어: "#5283FF",
  한국사: "#FFE252",
};

// 학교/학년 기준으로 교과서를 받아오는 API가 아직 없어서, 화면 흐름만 확인할 수 있도록 목업 데이터로 대체합니다.
const MOCK_TEXTBOOKS: Textbook[] = [
  { id: "math-1", subject: "수학", title: "수학 1 (류희찬)", publisher: "천재교과서" },
  { id: "math-2", subject: "수학", title: "수학 1 (황선욱)", publisher: "미래엔" },
  { id: "korean-1", subject: "국어", title: "국어 1-1 (노미숙)", publisher: "천재교과서" },
  { id: "korean-2", subject: "국어", title: "국어 1-1 (민병곤)", publisher: "미래엔" },
  { id: "korean-3", subject: "국어", title: "국어 1-2 (민병곤)", publisher: "미래엔" },
  { id: "history-1", subject: "한국사", title: "한국사 (최병택)", publisher: "미래엔" },
  { id: "history-2", subject: "한국사", title: "한국사 (신유아)", publisher: "천재교육" },
];

// ================================
// Components
// ================================

function TextbookCard({ textbook, selected, onPress, width }: { textbook: Textbook; selected: boolean; onPress: () => void; width: number }) {
  const color = SUBJECT_COLORS[textbook.subject];

  return (
    <Pressable onPress={onPress} style={{ width }}>
      <Stack gap="s">
        <View
          style={{
            aspectRatio: 3 / 4,
            backgroundColor: `${color}26`,
            borderWidth: selected ? 2 : 0,
            borderColor: "#F6482D",
          }}
          className="items-center justify-center rounded-xxs overflow-hidden"
        >
          <Icon name="book" size={32} color={color} />
          {selected && <View className="absolute inset-0" style={{ backgroundColor: "rgba(246,72,45,0.3)" }} />}
          {selected && (
            <View className="absolute top-xs right-s bg-primary-500 rounded-full items-center justify-center w-5 h-5">
              <Icon name="check" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Stack gap="xxs">
          <Text variant="base-small" weight="medium" numberOfLines={1}>{textbook.title}</Text>
          <Text variant="base-small" color="secondary" numberOfLines={1}>{textbook.publisher}</Text>
        </Stack>
      </Stack>
    </Pressable>
  );
}

/**
 * 교과서 선택 화면
 * @description 학교/학년에 맞는 교과서를 과목별로 필터링해 여러 개 선택합니다. (학교 API 연동 전이라 목업 데이터로 화면 흐름만 구성)
 */
export default function TextbookSelect() {
  const { school, grade, classNum } = useLocalSearchParams<{ school: string; grade: string; classNum: string }>();
  const [tab, setTab] = useState<SubjectTab>("전체");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gridWidth, setGridWidth] = useState(0);

  const cardWidth = (gridWidth - CARD_GAP * (COLUMNS - 1)) / COLUMNS;

  const handleGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  const visibleTextbooks = useMemo(
    () => (tab === "전체" ? MOCK_TEXTBOOKS : MOCK_TEXTBOOKS.filter((textbook) => textbook.subject === tab)),
    [tab]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleComplete = () => {
    router.push({
      pathname: "/StudyStyle",
      params: { school, grade, classNum, textbooks: selectedIds.join(",") },
    });
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />

      <Row width="full" align="between" className="items-center pb-l">
        <Text variant="title-medium">교과서 선택</Text>
        <Text color="secondary">{selectedIds.length}개 선택됨</Text>
      </Row>

      <Row gap="s" className="flex-wrap pb-l">
        {TABS.map((t) => {
          const isSelected = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-l py-m rounded-full ${isSelected ? "bg-neutral-600" : "border border-neutral-600"}`}
            >
              <Text variant="base-large" weight="medium">{t}</Text>
            </Pressable>
          );
        })}
      </Row>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Row gap="xl" width="full" className="flex-wrap" onLayout={handleGridLayout}>
          {gridWidth > 0 &&
            visibleTextbooks.map((textbook) => (
              <TextbookCard
                key={textbook.id}
                textbook={textbook}
                selected={selectedIds.includes(textbook.id)}
                onPress={() => toggleSelect(textbook.id)}
                width={cardWidth}
              />
            ))}
        </Row>
      </ScrollView>

      <Button variant={selectedIds.length > 0 ? "primary" : "disabled"} onPress={handleComplete} className="mt-l"> 선택 완료 </Button>
    </View>
  );
}
