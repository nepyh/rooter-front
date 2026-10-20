import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Stack, Row } from "@/components/layout";
import { Text, LoadingView } from "@/components/ui";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject } from "@/api/home/common/catalog";
import type { Subject, Textbook } from "@/api/home/common/catalog";
import { getUserInfo } from "@/api/common/user";
import { useUserStore } from "@/store";
import { color } from "@/constants/token/color";
import { getSpacing } from "@/utils/common/token";

// ================================
// Types
// ================================

export interface TextbookWithSubject extends Textbook {
  subjectName: string;
}

type PillState = "active" | "inactive";

// ================================
// Styles
// ================================

const pillStyles: Record<PillState, string> = {
  "active": "bg-neutral-600",
  "inactive": "border border-neutral-600",
};

// ================================
// Components
// ================================

function SubjectPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`px-spacing-5 py-spacing-4 rounded-radius-full ${pillStyles[active ? "active" : "inactive"]}`}>
      <Text variant="base-medium" weight="medium" className="text-text-primary">{label}</Text>
    </Pressable>
  );
}

function TextbookCard({ textbook, selected, onPress }: { textbook: TextbookWithSubject; selected: boolean; onPress: () => void }) {
  const publisherName = textbook.publisherName ?? textbook.title.match(/\(([^)]+)\)\s*$/)?.[1] ?? textbook.subjectName;
  const displayTitle = textbook.title.replace(/\s*\([^)]+\)\s*$/, "");

  return (
    <Pressable onPress={onPress} className="gap-spacing-3" style={{ width: 104 }}>
      <View
        className="rounded-radius-1 bg-neutral-700 items-center justify-center overflow-hidden"
        style={{ aspectRatio: 210 / 270, borderWidth: selected ? 2 : 0, borderColor: color.primary["500"] }}
      >
        {textbook.coverImageUrl ? (
          <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="book" size={32} color={color.neutral["400"]} />
        )}
        {selected && <View className="absolute inset-spacing-0 bg-primary-500/30" />}
        {selected && (
          <View className="absolute w-spacing-6 h-spacing-6 rounded-radius-full bg-primary-500 items-center justify-center" style={{ top: getSpacing("spacing-2"), right: getSpacing("spacing-2") }}>
            <Icon name="check" size={12} color={color.neutral["0"]} />
          </View>
        )}
      </View>
      <Stack gap="xxs" width="full">
        <Text variant="base-small" weight="medium" className="text-text-primary" numberOfLines={1}>{displayTitle}</Text>
        <Text variant="base-small" color="secondary" numberOfLines={1}>{publisherName}</Text>
      </Stack>
    </Pressable>
  );
}

interface Props {
  selectedIds: Set<number>;
  onToggle: (textbook: TextbookWithSubject) => void;
  bottomInset?: number;
}

/**
 * 과목 탭 + 교과서 표지 3열 격자 (Figma Textbooks 1956:3334 · Add 2:1191)
 * @param selectedIds 선택된 교과서 ID 목록을 설정합니다.
 * @param onToggle 교과서를 눌렀을 때 실행할 행동을 입력합니다.
 * @param bottomInset 격자 아래 여백(하단 버튼에 가리지 않게)을 설정합니다.
 */
export function TextbookPicker({ selectedIds, onToggle, bottomInset = 96 }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [textbooks, setTextbooks] = useState<TextbookWithSubject[]>([]);
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

  useEffect(() => {
    if (userId === null) return;
    getUserInfo(userId).then((info) => setGrade(info.grade)).catch(() => setGrade(null));
  }, [userId]);

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

  const visibleTextbooks = grade === null
    ? textbooks
    : textbooks.filter((textbook) => {
      const titleGrade = textbook.title.match(/^(\d)학년/)?.[1];
      return titleGrade === undefined || Number(titleGrade) === grade;
    });

  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0 pb-spacing-6">
        <Row gap="s">
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
      </ScrollView>

      {loadingTextbooks ? <LoadingView /> : (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        <View className="flex-row flex-wrap" style={{ gap: getSpacing("spacing-6") }}>
          {visibleTextbooks.map((textbook) => (
            <TextbookCard
              key={textbook.id}
              textbook={textbook}
              selected={selectedIds.has(textbook.id)}
              onPress={() => onToggle(textbook)}
            />
          ))}
        </View>
      </ScrollView>
      )}
    </View>
  );
}
