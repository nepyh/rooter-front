import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Stack, Row } from "@/components/layout";
import { Text } from "@/components/ui";
import { Icon } from "@/assets";
import { getSubjects, getTextbooksBySubject } from "@/api/catalog";
import type { Subject, Textbook } from "@/api/catalog";
import { getUserInfo } from "@/api/user";
import { useUserStore } from "@/store";
import palette from "@/constants/palette";

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
    <Pressable onPress={onPress} className={`px-l py-m rounded-full ${pillStyles[active ? "active" : "inactive"]}`}>
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
        style={{ aspectRatio: 210 / 270, borderWidth: selected ? 2 : 0, borderColor: palette.primary["500"] }}
      >
        {textbook.coverImageUrl ? (
          <Image source={{ uri: textbook.coverImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="book" size={32} color={palette.neutral["400"]} />
        )}
        {selected && <View className="absolute inset-0 bg-primary-500/30" />}
        {selected && (
          <View className="absolute w-5 h-5 rounded-full bg-primary-500 items-center justify-center" style={{ top: 4, right: 4 }}>
            <Icon name="check" size={12} color={palette.neutral["0"]} />
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

  // 제목이 "N학년 ..."으로 시작해서 학년 기준으로 거름, 학년 표기 없는 교과서는 유지
  const visibleTextbooks = grade === null
    ? textbooks
    : textbooks.filter((textbook) => {
      const titleGrade = textbook.title.match(/^(\d)학년/)?.[1];
      return titleGrade === undefined || Number(titleGrade) === grade;
    });

  return (
    <View className="flex-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0 pb-xl">
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        <View className="flex-row flex-wrap" style={{ gap: 20 }}>
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
    </View>
  );
}
